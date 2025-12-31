# 🛡️ SQLi-IDPS: Intelligent SQL Injection Detection & Prevention System

<!-- Badges Section -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/release/python-3110/)
[![Framework: Flask](https://img.shields.io/badge/Framework-Flask-lightgrey.svg)](https://flask.palletsprojects.com/)
[![Proxy: Nginx](https://img.shields.io/badge/Proxy-Nginx-green.svg)](https://www.nginx.com/)
[![Detection: Hybrid ML](https://img.shields.io/badge/Detection-Hybrid%20ML-red.svg)]()
[![Project Status: Graduation Project](https://img.shields.io/badge/Status-Graduation%20Project-brightgreen.svg)]()

---


Welcome to the repository of my graduation project: **SQLi-IDPS**, an intelligent system designed to detect and prevent **SQL Injection (SQLi)** attacks. I developed this system to provide a robust, real-time defense layer for web applications using a **Reverse Proxy** architecture.

The core objective of this project was to build a security solution that sits in front of any web application, inspecting incoming traffic and blocking malicious payloads before they ever reach the backend server.

---

## 🧠 How It Works (Hybrid Detection Methodology)

I implemented a **Hybrid Detection Strategy** that combines speed with high accuracy:

1.  **Nginx Reverse Proxy:** All incoming HTTP/HTTPS requests are intercepted by Nginx. Using a custom **Lua** module, the request data is forwarded to my inspection service.
2.  **Dual-Layer Inspection:**
    *   **Signature-based Detection:** Utilizing the `libinjection` library for lightning-fast detection of known SQLi patterns.
    *   **Machine Learning-based Detection:** Leveraging a trained **Support Vector Machine (SVM)** model to identify complex, obfuscated, or zero-day attacks that traditional signatures might miss.
3.  **Real-time Response:** If an attack is detected, the request is blocked immediately with a `403 Forbidden` response. The incident is logged, and an instant alert is sent to the administrator via Email/SMS.

### System Architecture

The following diagram illustrates the data flow and how the components interact:

![System Architecture](https://private-us-east-1.manuscdn.com/sessionFile/S9F3kNuf4LvfJo94DwMLZJ/sandbox/55KmUP0Xuw84bqXTHkU8UN-images_1767218169778_na1fn_L2hvbWUvdWJ1bnR1L2RvY3MvYXJjaGl0ZWN0dXJl.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvUzlGM2tOdWY0THZmSm85NER3TUxaSi9zYW5kYm94LzU1S21VUDBYdXc4NGJxWFRIa1U4VU4taW1hZ2VzXzE3NjcyMTgxNjk3NzhfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyUnZZM012WVhKamFHbDBaV04wZFhKbC5wbmciLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=sLvkah0qw1HOcNGrAx3X-YnJIHZX~RmbQmpUZHwxGY0n3XAM-S0KwDUSfDOgNj-cMsSvl3CWXBjWVi0tTSCR6wCmkPvCOZb-WQt9NfxJ2EPPj85ymER2EXbj87-TRAKX-Pqz2ylcML9DYJ0dvteBPParfJ5fK1kQL0qtZ-RwQohYXh2mtH6f3cfsOg5uFLym3lbLJSEdvVFEpnk8cATQTyNtIlySWnCkAGszOOFjpZa0RT7REk1cpPpiEHz8jjNAw5Rz4aB1hTiaN~3iaodmOXnzRc84-lXa9TjqRIpaD1M1KJ3Cxxg4IRiBZFGDYEsjZYENlb95LOiTPFY6LBtxPw__)

---

## 💻 Technologies & Tools

I chose a powerful stack to ensure reliability and performance:

| Component | Technology | My Role |
| :--- | :--- | :--- |
| **Backend Service** | **Python + Flask** | Developed the inspection engine, RESTful APIs, and management logic. |
| **Web Server/Proxy** | **Nginx + Lua** | Configured the reverse proxy and integrated it with the Python backend. |
| **AI/Machine Learning** | **Scikit-learn (SVM)** | Trained and optimized the ML model for high-precision detection. |
| **Frontend Dashboard** | **React.js (Integrated)** | Designed a modern UI for monitoring logs, alerts, and system status. |
| **Database** | **SQLite / SQLAlchemy** | Managed local storage for incident logs and system configurations. |

---

## 📸 System Screenshots

Here is a look at the final product in action:

| Feature | Screenshot |
| :--- | :--- |
| **Login Interface** | ![Login Page](docs/screenshots/login.png) |
| **Main Dashboard** | ![Dashboard Overview](docs/screenshots/dashboard.png) |
| **Detection Reports** | ![Alerts Log](docs/screenshots/alerts_log.png) |
| **Workflow Diagram** | ![Process Flow Diagram](docs/screenshots/process_flow.png) |

---

## 🚀 Quick Start Guide

To run this project locally:

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
2.  **Run the Application:**
    ```bash
    python main.py
    ```
3.  **Access the Dashboard:** Open `http://localhost:5000` in your browser.
    *   **Default Credentials:** `admin` / `password`

---

## 👨‍🎓 Project Information

This project was completed as part of the requirements for a Bachelor's degree in **Cybersecurity**.

*   **Academic Institution:** University of Science and Technology.
*   **e-mail:** [alaqlqlan47@gmail.com ]
*   **Developed by:** [khaled abdulsattar]

---

## ⚖️ License
This project is licensed under the **MIT License**. See the [MIT License.md] file for details.
