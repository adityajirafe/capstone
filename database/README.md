# Connecting a Supabase database to Tableau

## Step 1: Gather Connection Details

Supabase URL: You’ll need the database connection URL from your Supabase project. You can find it in the "Settings" tab under "Database" in your Supabase project.
Database Credentials: You also need the database username and password, which you can find under "Settings" > "Database" > "Connection Pooling" in Supabase.

## Step 2: Install the PostgreSQL Driver

Since Supabase uses PostgreSQL as its database, you’ll need the PostgreSQL driver for Tableau.

Download the Driver:
Visit the PostgreSQL ODBC Driver download page and download the appropriate version for your system.
Install the driver following the installation instructions.

## Step 3: Connect Tableau to Supabase

Open Tableau:

Launch Tableau Desktop.
Select the Database Connection:

In the Start page, click on "More" under "To a Server".
Choose PostgreSQL from the list of data sources.
Enter Connection Details:

In the connection dialog that appears, enter the following:
Server: The Supabase database connection URL (just the hostname, e.g., db.yourproject.supabase.co).
Port: Default PostgreSQL port is 5432.
Database: The name of your database (usually it's your project name).
Username: Your Supabase database username.
Password: Your Supabase database password.
Test the Connection:

Click on "Sign In" to connect. Tableau will verify the credentials and establish a connection.

## Step 4: Build Your Dashboard

Select Data:

Once connected, you’ll see a list of tables in your Supabase database. Drag and drop the tables you want to use into the workspace.
Create Visualizations:

Start creating your visualizations and dashboards using the data from your Supabase database.

## Step 5: Publish Your Dashboard (Optional)

If you want to share your Tableau dashboard, you can publish it to Tableau Server or Tableau Public, depending on your needs.
Troubleshooting
Connection Issues: If you encounter connection errors, double-check your credentials and ensure that your Supabase database is set to allow connections from your IP address (if applicable).
Driver Issues: Ensure that the PostgreSQL ODBC driver is correctly installed and compatible with your version of Tableau.
By following these steps, you should be able to successfully connect your Supabase database to Tableau and start visualizing your data!
