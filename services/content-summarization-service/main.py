from app.app import app as api

app = api

if __name__ == "__main__":
    app.run(debug=True)