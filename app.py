from flask import Flask, render_template, request
import joblib
from scipy.sparse import csr_matrix

app=Flask(__name__)

model=joblib.load('models/spam.joblib')
vectorizer=joblib.load('models/tfidf.joblib')

@app.route('/',methods=['GET','POST'])
def index():
    prediction=""
    if request.method=='POST':
        message=request.form['message']
        vect=vectorizer.transform([message]).toarray()
        prediction=model.predict(vect)[0]
    return render_template("index.html",prediction=prediction)

if __name__=='__main__':
    app.run(debug=True)