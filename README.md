# Data Validation and Indicator Analysis Script

## Purpose
This script validates and analyzes the ESG data collected across companies and years. It simplifies the identification of:

- Indicators present in each report and their yearly availability.
- Differences in units of measurement (e.g., million tons vs. tons) to standardize the data and ensure proper pre-processing.
Requirements

## Install the necessary libraries using:
```
pip install pandas numpy matplotlib seaborn
```

## How to Use

- Place your dataset in the root directory as data.csv or adjust the file_path variable.
- Run the script to clean, validate, and export results to the data_findings/ directory.

## Key Features

- Data Cleaning: Removes unwanted columns and handles missing values.
- Indicator Presence Analysis: Tabulates indicators for each company across years and saves it to indicator_presence.csv.
- Unit Validation: Identifies unique rows based on Indicator, Company, Units, and Remarks, then saves the results to indicators.csv.

## Output Files

- data_findings/indicator_presence.csv: Tabulation of indicators by company and year.
- data_findings/indicators.csv: Unique rows based on indicator and unit validation.
