
#%%
import pandas as pd
import numpy as np
import glob

#%%
dir_base = "./raw_data/"
flag = False
#%%
for fname in glob.glob(f"{dir_base}/SASB*.csv"):
    print(fname.split('- ')[1].split('.')[0])
    df = pd.read_csv(fname)
    #print(df.columns)
    inter = df[['category', 'indicator', 'sasb_indicator_name', 'sub_category', 'user_units', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']].rename(columns={'indicator': 'indicator', 'sasb_indicator_name': 'indicator_name', 'sub_category': 'sub_category', 'user_units': 'unit', 'category': 'category'})
    inter_2 = pd.melt(inter, id_vars=['category', 'indicator', 'indicator_name', 'unit', 'sub_category'], value_vars=['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']).rename(columns = {'variable': 'year'})
    inter_2['company name'] = fname.split('- ')[1].split('.')[0]
    inter_2 = inter_2.dropna(subset=['value'])
    if flag:
        base = pd.concat([base, inter_2])
    else:
        base = inter_2
        flag = True
    inter_2.to_csv(f'{dir_base}/{fname.split("- ")[1].split(".")[0]}.csv')

#%%
#base.to_csv('raw_data_231024.csv')