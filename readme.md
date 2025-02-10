# CV Submission Manager

The CV Submissions Manager is a web application designed to streamline the process of managing and reviewing CV submissions. Built with a FastAPI backend and a React frontend, this application allows users to upload CVs, track application statuses, and review submissions efficiently.


## Usage <a name = "Usage"></a>

1. Clone the repository:
   ```sh
   git clone https://github.com/lmakinaa/submissions-manager
   cd submissions-manager
   ```

2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```sh
   pip install -r backend/requirements.txt
   ```

4. Run the FastAPI server:
   ```sh
	uvicorn backend.main:app
   ```

5. Run the frontend:
	```sh
	cd frontend; npm i; npm run dev
	```
