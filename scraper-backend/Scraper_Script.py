import pandas as pd
import os
import openai
from dotenv import load_dotenv
import sys
import concurrent.futures
import time
from tqdm import tqdm

#Load environment variables from .env file
load_dotenv()

apikey = os.getenv('OPENAI_API_KEY')

#Load template that we want to follow
template = pd.read_csv('SASB Indicators - Template.csv')
template = template[['Category','Indicator','SASB Indicator Name', 'Sub-Category']]

from typing_extensions import override
from openai import AssistantEventHandler, OpenAI


#Creating the Event Handler class to run threads
class EventHandler(AssistantEventHandler):
    @override
    def on_message_done(self, message) -> None:
        # print a citation to the file searched
        client = OpenAI()
        message_content = message.content[0].text
        annotations = message_content.annotations
        citations = []
        for index, annotation in enumerate(annotations):
            message_content.value = message_content.value.replace(
                annotation.text, f"[{index}]"
            )
            if file_citation := getattr(annotation, "file_citation", None):
                cited_file = client.files.retrieve(file_citation.file_id)
                citations.append(f"[{index}] {cited_file.filename}")

#creating and defining prompt
def extract_info(prompt, assistant, company):

  from openai import OpenAI

  client = OpenAI(api_key=apikey)

  # Create a thread and attach the file to the message
  thread = client.beta.threads.create(
    messages=[
      {
        "role": "user",
        "content": f"""Extract {company}'s '{prompt}' in this report.""",
        # Attach the new file to the message.
      },
    ]
  )
  # assistant = assistant

  with client.beta.threads.runs.stream(
    thread_id=thread.id,
    assistant_id=assistant.id,
    event_handler=EventHandler(),
  ) as stream:
    stream.until_done()

  txt = openai.beta.threads.messages.list(thread.id).data[0].content[0].text.value
  #print(openai.beta.threads.messages.list(thread.id))
  return(txt)

# function to extract out the json code
def get_json(outs):
  final = []
  for out in outs:
    try:
      split = out.split("```json")[1].split("```")[0]
      final.append(split)
    except:
      final.append(out)
  return final


#function to write out how the final dataframe is created from the ingested json data
def write_df(results):

  import pandas as pd
  import json

  df = pd.DataFrame()
  counter = 0

  for result in results:
    try:
      result_df = pd.DataFrame(json.loads(result)['values'])
    except:
      pass
    else:
      num_entries = len(result_df)

      if num_entries > 0:
        metric = template.iloc[counter] #cycle through every metric in template
        result_df.insert(3, 'Sub-Category', metric['Sub-Category'])
        result_df.insert(0, 'Indicator', metric['Indicator'])
        result_df.insert(1, 'SASB Indicator Name', metric['SASB Indicator Name'])
        #result_df['remark'] = [metric] * num_entries
        df = pd.concat([df,result_df], ignore_index=True)
    counter += 1
  return df

#This section details how an assistant and vector store is created. The previous functions are included in the following code which includes querying and parsing.
def parse_doc(company, sus_report):

  from openai import OpenAI

  client = OpenAI(api_key=apikey)

  #Create Assistant to scrape Data
  assistant = client.beta.assistants.create(
    name=f"{company} Data Scraper",
    instructions=
    f"""You are an ESG data scraper for {company}."""
     +
    """You will be provided a pdf file which contains many ESG tables. You will be tasked to extract out ESG information.

    Please provide a structured response with the following JSON schema:
    {
      "values" : [Fact]
    }

    Where each fact has the following JSON schema:
    {
      "year": "integer"
      "value": "float"
      "unit": "string"
    }

    Please do not do any calculations and always extract the number from the report.

    If you cannot find the data, please return an empty dictionary in the form of {}. If any of the values are not present, please return NA for that attribute.

    """,
    model="gpt-4o-mini",
    tools=[{"type": "file_search"}],
    top_p = 0.01 #take top 1% of all possible future tokens
  )


  # Create a vector store caled "{Company} Databook"
  vector_store = client.beta.vector_stores.create(name=f"{company} Databook", expires_after = {'anchor': 'last_active_at', 'days': 7})

  # Ready the files for upload to OpenAI
  file_paths = [sus_report]
  file_streams = [open(path, "rb") for path in file_paths]

  # Use the upload and poll SDK helper to upload the files, add them to the vector store,
  # and poll the status of the file batch for completion.
  file_batch = client.beta.vector_stores.file_batches.upload_and_poll(
    vector_store_id=vector_store.id, files=file_streams
  )

  # You can print the status and the file counts of the batch to see the result of this operation.
  # print(file_batch.status)
  # print(file_batch.file_counts)

  #Attach vector store to assistant
  assistant = client.beta.assistants.update(
    assistant_id=assistant.id,
    tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
  )


  template_list = template['Sub-Category'].tolist()

  no_queries = len(template_list)
  ass_list = [assistant] * no_queries
  company_list = [company] * no_queries
  

  # Using ThreadPoolExecutor to create a list in parallel
  with concurrent.futures.ProcessPoolExecutor() as executor: #if errors occur, reduce the processpoolexecutor size (put 1 in ())
    with tqdm(total = no_queries, desc = 'Processing Queries') as pbar:
      i = 0
      results = []
      # Map the function to the inputs in parallel
      for result in executor.map(extract_info, template_list, ass_list, company_list):
        result.append(result)
        pbar.update(1)
        i += 1
        #print progress
        progress_percent = (i / no_queries) * 100
        print(f'Progress: {progress_percent:.2f}%')
  return results

#Post processing dataframe to fit our predefined template
def get_csv(results):
  df = write_df(get_json(results))
  #If we want the long format of the data 
  #df.to_csv(f'{company} data.csv', index = False,encoding='utf-8-sig') #to ensure characters come out in plain text

  return df

def to_template(df):
  df.drop_duplicates(subset = ['Indicator','SASB Indicator Name','year','unit','Sub-Category'], keep = 'first', inplace = True) #keep first entry (usually if there are duplicates the scraper is reading other mines)
  df = df.pivot(index = ['Indicator','SASB Indicator Name','unit','Sub-Category'], columns = 'year', values = 'value')
  df.reset_index(inplace = True)
  company_template = pd.merge(template, df, on = ['Indicator','SASB Indicator Name', 'Sub-Category'], how = 'left')
  #company_template.to_csv(f'{company} Template.csv', index = False, encoding='utf-8-sig') #place this in the scrape function instead

  return company_template

#Consolidating all the functions to return out final csv file 
def scrape(company_name, output_path, pdf):
    print('i am scraping')
    company_results = parse_doc(company_name, pdf)
    company_data = get_csv(company_results)
    company_template = to_template(company_data)
    company_template.to_csv(output_path, index = False, encoding='utf-8-sig')
    return company_template


def dummy_extract_info(dummy):
  time.sleep(1)

  return [dummy]

def test_csv(company_name, output_path, pdf):
  print('testing')
  with concurrent.futures.ProcessPoolExecutor() as executor: #if errors occur, reduce the processpoolexecutor size (put 1 in ())
    with tqdm(total = 100, desc = 'Processing Queries') as pbar:
      results = []
      i = 0
      dummy = [0] * 100
      # Map the function to the inputs in parallel
      for result in executor.map(dummy_extract_info, dummy):
        result.append(result)
        pbar.update(1)
        i += 1
        #print progress
        progress_percent = (i / 100) * 100
        print(f'Progress: {progress_percent:.2f}%')
  test_df = pd.DataFrame(columns = ['test'])
  test_df.to_csv(output_path, index = False, encoding='utf-8-sig')
  return True
  

if __name__ == "__main__":

    # Arguments passed from the Flask app
    custom_name = sys.argv[1]         # The path to the uploaded PDF file
    output_csv = sys.argv[2]      # The path where the generated CSV file should be saved
    input_pdf = sys.argv[3]       # The custom file name provided by the user

    # Call the function to process the PDF and generate the Excel file
    scrape(custom_name, output_csv, input_pdf) #TODO: Uncomment this when read, right now it will make every file upload take a while and spend quite a bit of money
    
    #Temporary call TODO: remove uploaded csv file after call when using real function
    #test_csv(custom_name, output_csv, input_pdf)
    
