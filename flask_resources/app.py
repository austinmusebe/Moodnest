from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from collections import Counter
import os

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///resources.db'
db = SQLAlchemy(app)

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)

class MoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mood = db.Column(db.String(20), nullable=False)
    reasons = db.Column(db.String(255))  # Store reasons as a comma-separated string
    entry = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow) #Add a timestamp.

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('/index.html')

@app.route('/breath.html')
def breath():
    return render_template('breath.html')

@app.route('/moodLog.html', methods=['GET', 'POST'])
def mood_log():
    if request.method == 'POST':
        mood = request.form.get('mood')
        reasons_list = request.form.getlist('reasons')  # Get a list of selected reasons
        reasons = ','.join(reasons_list)  # Convert list to comma-separated string
        entry = request.form.get('entry')

        new_mood_log = MoodLog(mood=mood, reasons=reasons, entry=entry)
        db.session.add(new_mood_log)
        db.session.commit()

        return jsonify({'message': 'Mood log saved successfully!'}) #Return a json response.
    return render_template('moodLog.html')

@app.route('/analyze_moods')
def analyze_moods():
    all_logs = MoodLog.query.all()

    mood_counts = Counter(log.mood for log in all_logs)
    most_popular_mood = mood_counts.most_common(1)[0][0] if mood_counts else None

    reasons_for_popular_mood = []
    for log in all_logs:
        if log.mood == most_popular_mood and log.reasons:
            reasons_for_popular_mood.extend(log.reasons.split(','))

    reason_counts = Counter(reasons_for_popular_mood)
    most_frequent_reasons = reason_counts.most_common(5) # Get the top 5 reasons

    mood_trend_data = [{'timestamp': log.timestamp.isoformat(), 'mood': log.mood} for log in all_logs]

    return jsonify({
        'most_popular_mood': most_popular_mood,
        'most_frequent_reasons': most_frequent_reasons,
        'mood_trend_data': mood_trend_data
    })

@app.route('/resources.html', methods=['GET', 'POST'])
def resources():
    if request.method == 'POST':
        # ... (rest of your resource submission code)
        pass
    resources = Resource.query.all()
    return render_template('resources.html', resources=resources)

@app.route('/get_resources', methods=['GET'])
def get_resources():
    resources = Resource.query.all()
    resource_list = [{'id': res.id, 'name': res.name, 'url': res.url, 'description': res.description, 'category': res.category} for res in resources]
    return jsonify(resource_list)

if __name__ == '__main__':
    app.run(debug=True)