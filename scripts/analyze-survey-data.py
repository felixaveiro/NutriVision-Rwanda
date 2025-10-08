import requests
import pandas as pd
import json
from datetime import datetime

# Fetch the survey datasets
dataset1_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/search-10-07-25-044925-toTDHZ17SCaSZH6EcMdcIe8ci7jy0p.csv"
dataset2_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/search-10-07-25-044744-a1cQMagROWWVQynl8xJSxdoG1GjdXl.csv"

print("[v0] Fetching survey datasets...")

# Load datasets
df1 = pd.read_csv(dataset1_url)
df2 = pd.read_csv(dataset2_url)

print(f"[v0] Dataset 1 shape: {df1.shape}")
print(f"[v0] Dataset 2 shape: {df2.shape}")

# Combine datasets
df_combined = pd.concat([df1, df2], ignore_index=True)
df_combined = df_combined.drop_duplicates(subset=['id'])

print(f"[v0] Combined dataset shape: {df_combined.shape}")
print(f"[v0] Columns: {df_combined.columns.tolist()}")

# Analyze the data
print("\n[v0] Data Summary:")
print(df_combined.info())
print("\n[v0] Sample records:")
print(df_combined.head())

# Extract unique surveys
print(f"\n[v0] Total unique surveys: {df_combined['surveyid'].nunique()}")
print(f"[v0] Date range: {df_combined['data_coll_start'].min()} - {df_combined['data_coll_end'].max()}")

# Group by year to see survey distribution
year_distribution = df_combined.groupby('data_coll_start').size()
print("\n[v0] Surveys by year:")
print(year_distribution)

# Extract authorities
authorities = df_combined['authenty'].unique()
print(f"\n[v0] Survey authorities: {len(authorities)} unique")

# Save processed data for the application
output_data = {
    "total_surveys": len(df_combined),
    "date_range": {
        "start": int(df_combined['data_coll_start'].min()),
        "end": int(df_combined['data_coll_end'].max())
    },
    "surveys_by_year": year_distribution.to_dict(),
    "surveys": df_combined.to_dict('records')
}

# Save to JSON for use in the app
with open('survey-data-processed.json', 'w') as f:
    json.dump(output_data, f, indent=2, default=str)

print("\n[v0] Data processed and saved to survey-data-processed.json")
