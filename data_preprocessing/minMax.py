#%%
import pandas as pd

#%%
df = pd.read_csv("C:/Users/tmxfe/OneDrive/Desktop/Acad/BT4103/SUBMIT MODULE/test_rows.csv")
df.head()

#%%
df.groupby(['indicator', 'subcategory', 'std_1'])['value'].agg(['min', 'max']).reset_index().to_csv('minMax2.csv')

# %%
