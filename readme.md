# CV Submission Manager

The **CV Submission Manager** is a web application designed to streamline the process of managing and reviewing CV submissions. Built with a **FastAPI** backend and a **React** frontend, this application allows users to upload CVs, track application statuses, and review submissions efficiently.

## Features
- Upload and manage CV submissions (in the root page '/')
- Track application statuses (in the admin page '/admin')
- Review and filter submitted CVs (in the admin page '/admin')
- FastAPI backend with React frontend

## Getting Started

### Running the Project
You can start the project by running the `start.sh` script:

```sh
bash start.sh
```

Alternatively, you can run it manually by following these steps:

### Backend Setup

1. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

2. Install dependencies:
   ```sh
   pip install -r backend/requirements.txt
   ```

3. Start the FastAPI server:
   ```sh
   uvicorn backend.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```

## Contributing
Feel free to contribute by submitting issues or pull requests. Ensure you follow best coding practices and provide clear documentation for any changes.

## License
This project is licensed under the MIT License.

