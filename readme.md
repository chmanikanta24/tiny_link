Description:
TinyLink is a lightweight URL-shortening application similar to bit.ly.
Users can shorten long URLs using custom short codes, view click statistics, delete links, and see redirect activity.

Features:

Create short links

Custom code support (6–8 alphanumeric characters)

Unique code validation

URL validation

Redirect using HTTP 302

Click tracking

Last-clicked timestamp updates

Delete existing links

Dashboard showing all links

Stats page showing link information

Health check endpoint

API compatible with autograding requirements

Tech Stack:
Backend:

Node.js

Express

PostgreSQL (Neon)

pg library

dotenv

cors

Frontend:

HTML

Tailwind CSS

JavaScript fetch API

Project Structure:
tinylink/
server.js
db.js
routes/links.js
public/index.html
public/stats.html
.env
package.json
README.txt

Database Schema:
Table: links
Columns:

code (VARCHAR 8, primary key)

target_url (TEXT)

clicks (INT, default 0)

last_clicked (TIMESTAMP)

Environment Variables (inside .env):
DATABASE_URL=your_neon_database_url_here
BASE_URL=http://localhost:5000

Running the Project Locally:

Install Node packages:
npm install

Start the backend:
node server.js
Runs on: http://localhost:5000

Run the frontend using live-server:
live-server
Frontend loads at: http://127.0.0.1:8080

API Endpoints:
POST /api/links → Create short link
GET /api/links → List all links
GET /api/links/:code → Get stats for a code
DELETE /api/links/:code → Delete link
GET /:code → Redirect to long URL
GET /healthz → Health check

Health Check Response:
{"ok": true, "version": "1.0"}

Stats Page:
Open stats using:
stats.html?code=YOURCODE

Redirect:
Open:
http://localhost:5000/YOURCODE