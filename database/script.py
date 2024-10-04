import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Google Sheets and Supabase credentials from environment variables
google_credentials_path = os.getenv("GOOGLE_CREDENTIALS_PATH")
supabase_url = os.getenv("SUPABASE_URL")
supabase_api_key = os.getenv("SUPABASE_API_KEY")

# Google Sheets authentication
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
credentials = ServiceAccountCredentials.from_json_keyfile_name(google_credentials_path, scope)
gc = gspread.authorize(credentials)

# Initialize Supabase client
supabase: Client = create_client(supabase_url, supabase_api_key)

# Open Google Sheet by URL or name
sheet = gc.open_by_url("https://docs.google.com/spreadsheets/d/1iRmUFOxfjZbhOHdPtfeFJ5Sllb6EgDOuX6CgH9ms34s/edit")  # Replace with your Google Sheets URL

# Function to insert data into Supabase
def insert_into_supabase(row, company_name):
    # Check if the "Value" field is empty or non-numeric
    value = row["Value"].strip() if isinstance(row["Value"], str) else row["Value"]  # Strip whitespace
    value = value if value not in ["", "NA", "N/A"] else None  

    # Only insert if value is not None
    if value is not None and row["Year"].isdigit():
        # Insert the row into Supabase
        response = supabase.table("esg_data").insert({
            "category": row["Category"],
            "indicator": row["Indicator"],
            "sasb_indicator_name": row["SASB Indicator Name"],
            "sub_category": row["Sub-Category"],
            "units": row["Units"],
            "year": row["Year"],
            "value": value,  # Ensure value is numeric or None
            "company": company_name  # Add company name to the insert
        }).execute()
        return response
    else:
        return None  # Skip insertion if value is None

# Loop through each worksheet (skip the first and second sheets)
for i, worksheet in enumerate(sheet.worksheets()):
    if i < 2:
        continue  # Skip the first two sheets

    # Extract the company name from the worksheet title
    company_name = worksheet.title

    # Extract data into a pandas DataFrame
    data = worksheet.get_all_records()
    df = pd.DataFrame(data)

    # Melt the DataFrame to convert wide format to long format
    df_long = pd.melt(df, id_vars=["Category", "Indicator", "SASB Indicator Name", "Sub-Category", "Units"], var_name="Year", value_name="Value")

    # Drop rows with no value (NaN)
    df_long = df_long.dropna(subset=["Value"])

    # Insert each row into the database
    for index, row in df_long.iterrows():
        response = insert_into_supabase(row, company_name)
        if response is not None:
            print(f"Inserted: {response}")  # Optional: Print the response for confirmation
    
    print(i, company_name)
