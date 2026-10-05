from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def dashboard():
    return render_template("dashboard.html", page="Dashboard")

@app.route("/calculator")
def calculator():
    return render_template("calculator.html", page="Calculator")

@app.route("/subjects")
def subjects():
    return render_template("subjects.html", page="Subjects")

@app.route("/planner")
def planner():
    return render_template("planner.html", page="Planner")

@app.route("/analytics")
def analytics():
    return render_template("analytics.html", page="Analytics")

@app.route("/report")
def report():
    return render_template("report.html", page="Report")

@app.route("/about")
def about():
    return render_template("about.html", page="About")

if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0")
