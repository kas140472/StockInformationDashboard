from datetime import *; from dateutil.relativedelta import *
import requests

from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/")
def root():
    return app.send_static_file("index.html")


@app.route("/search-ci", methods=["GET"])
def search_ci():
    user_input = request.args.get("query")

    if user_input:
        api_url = f"https://finnhub.io/api/v1/stock/profile2?symbol={user_input}&token=cn11b0hr01quegsk70ngcn11b0hr01quegsk70o0"
        response = requests.get(api_url)
        
        company_info = response.json()
        data = {
            "company_info": company_info
        }
        return jsonify(data)
        
    else:
        return "Error"
    

@app.route("/search-sm", methods=["GET"])
def search_sm():
    user_input = request.args.get("query")

    if user_input:
        api_url = f"https://finnhub.io/api/v1/quote?symbol={user_input}&token=cn11b0hr01quegsk70ngcn11b0hr01quegsk70o0"
        response = requests.get(api_url)
        
        company_quote = response.json()
        data = {
            "company_quote": company_quote
        }
        return jsonify(data)
    else:
        return "Error"
    

@app.route("/search-rt", methods=["GET"])
def search_rt():
    user_input = request.args.get("query")

    if user_input:
        api_url = f"https://finnhub.io/api/v1/stock/recommendation?symbol={user_input}&token=cn11b0hr01quegsk70ngcn11b0hr01quegsk70o0"
        response = requests.get(api_url)
        
        company_recTrends = response.json()
        data = {
            "company_recTrends": company_recTrends
        }
        return jsonify(data)
    else:
        return "Error"


@app.route("/search-ch", methods=["GET"])
def search_ch():
    user_input = request.args.get("query")

    if user_input:

        ticker = user_input

        TODAY = date.today()
        sixMonthsAnd1dayBack = TODAY+relativedelta(months=-6, days=-1)
        fromDate = sixMonthsAnd1dayBack
        toDate = TODAY
        polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{fromDate}/{toDate}?adjusted=true&sort=asc&apiKey=K3aAkNxxIVq84NBHIhk5a82mE0KqnwP_"
        polygon_response = requests.get(polygon_url)
        polygon_data = polygon_response.json()
    
        data = {
            "polygon_data": polygon_data
        }

        return jsonify(data)
    else:
        return "Error"


@app.route("/search-nw", methods=["GET"])
def search_nw():
    user_input = request.args.get("query")
    
    if user_input:
        
        TODAY = date.today()
        BEFORE_30 = TODAY+relativedelta(days=-30)

        api_url = f"https://finnhub.io/api/v1/company-news?symbol={user_input}&from={BEFORE_30}&to={TODAY}&token=cn11b0hr01quegsk70ngcn11b0hr01quegsk70o0"
        response = requests.get(api_url)
        
        company_news = response.json()
        data = {
            "company_news": company_news
        }
        return jsonify(data)
        
    else:
        return "Error"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)