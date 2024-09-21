document.getElementById("clearBtn").addEventListener("click", function(){
  var myDiv = document.getElementById("containerWithoutSearch");
  myDiv.style.display = "none";
  document.getElementById("query").value = '';
  document.getElementById("errorDiv").style.display = "none";
  document.getElementById("query").removeAttribute("required");
})


function showDiv(id) {
  var divs = document.querySelectorAll('.content');
  for (var i = 0; i < divs.length; i++) {
    divs[i].style.display = 'none';
  }
  var selectedDiv = document.getElementById(id);
  selectedDiv.style.display = 'block';
}

function highlightButton(button) {
  var buttons = document.getElementsByClassName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("selected");
  }
  button.classList.add("selected");
}


document.getElementById("searchForm").addEventListener("submit", function(event) {
  event.preventDefault(); 
  document.getElementById("query").setAttribute("required", "required");
  showDiv('companyInfo');
  var companyInfoButton = document.getElementById('toggleCompanyInfo');
  highlightButton(companyInfoButton);

  const queryLow = document.getElementById("query").value;
  const query = queryLow.toUpperCase()
  const url_ci = `/search-ci?query=${query}`;
  
  var missingResult = false;

  fetch(url_ci)
  .then(response => response.text())
  .then(data => {
    console.log(data);
    var parsedData = JSON.parse(data);
    console.log(parsedData);

    if(Object.keys(parsedData.company_info).length === 0) {
      document.getElementById("containerWithoutSearch").style.display = "none";
      document.getElementById("errorDiv").style.display = "block";
      console.log("CAME IN")
      missingResult = true;
      return;
    }
    else {
      missingResult = false;
      document.getElementById("containerWithoutSearch").style.display = "inline-block";
      document.getElementById("errorDiv").style.display = "none";
      document.getElementById("companyInfo").style.display = 'block';
      const companyInfo = parsedData.company_info;
      console.log(companyInfo);
      document.getElementById("companyLogo").src = companyInfo.logo;
      document.getElementById("companyName").innerText = companyInfo.name;
      document.getElementById("stockTickerSymbol").innerText = companyInfo.ticker;
      document.getElementById("stockTickerSymbol_summary").innerText = companyInfo.ticker;
      document.getElementById("stockExchangeCode").innerText = companyInfo.exchange;
      document.getElementById("companyIpoDate").innerText = companyInfo.ipo;
      document.getElementById("category").innerText = companyInfo.finnhubIndustry;
    }
  })
  .catch(error => console.error('Error:', error));

  if(!missingResult) {
    const url_sm = `/search-sm?query=${query}`;

    fetch(url_sm)
    .then(response => response.text())
    .then(data => {
      var parsedData = JSON.parse(data);
      const companyQuote = parsedData.company_quote;

      const dateObject = new Date(companyQuote.t * 1000);
      const day = dateObject.getDate();
      const month = dateObject.toLocaleString('en-US', { month: 'long' });
      const year = dateObject.getFullYear();
      const formattedDate = `${day} ${month}, ${year}`;
      
      document.getElementById("tradingDay").innerText = formattedDate;

      document.getElementById("previousClosingPrice").innerText = companyQuote.pc;
      document.getElementById("openingPrice").innerText = companyQuote.o;
      document.getElementById("highPrice").innerText = companyQuote.h;
      document.getElementById("lowPrice").innerText = companyQuote.l;
      document.getElementById("changeText").innerText = companyQuote.d;
      if(companyQuote.d >= 0) {
        document.getElementById("changeImg").src = "static/GreenArrowUp.png";
      }
      else {
        document.getElementById("changeImg").src = "static/RedArrowDown.png";
      }
      document.getElementById("changePercentText").innerText = companyQuote.dp;
      if(companyQuote.dp >= 0) {
        document.getElementById("changePercentImg").src = "static/GreenArrowUp.png";
      }
      else {
        document.getElementById("changePercentImg").src = "static/RedArrowDown.png";
      }
    })
    .catch(error => console.error('Error:', error));

  }

  if(!missingResult) {
    const url_rt = `/search-rt?query=${query}`;

    fetch(url_rt)
    .then(response => response.text())
    .then(data => {
      var parsedData = JSON.parse(data);
      const companyRecTrends = parsedData.company_recTrends;
      document.getElementById("strong-sell").innerText = companyRecTrends[0].strongSell;
      document.getElementById("sell").innerText = companyRecTrends[0].sell;
      document.getElementById("hold").innerText = companyRecTrends[0].hold;
      document.getElementById("buy").innerText = companyRecTrends[0].buy;
      document.getElementById("strong-buy").innerText = companyRecTrends[0].strongBuy;
    })
    .catch(error => console.error('Error:', error));

  }
  

  if(!missingResult) {
    const url_ch = `/search-ch?query=${query}`;

    fetch(url_ch)
    .then(response => response.text())
    .then(data => {
      var parsedData = JSON.parse(data);
      (async () => {
        const polygonData = parsedData.polygon_data;
        const timestamps = [];
        const closePrices = [];
        const volumes = [];
        for (let i = 0; i < polygonData.results.length; i++) {
          timestamps.push(polygonData.results[i].t);
          closePrices.push(polygonData.results[i].c);
          volumes.push(polygonData.results[i].v);
        }
        let maxVolume = Math.max(...volumes);
        let minStockPrice = Math.min(...closePrices);

        const stockPriceVsDate = [];
        const volumeVsDate = [];
        for (let i = 0; i < polygonData.results.length; i++) {
          stockPriceVsDate.push([timestamps[i], closePrices[i]]);
          volumeVsDate.push([timestamps[i], volumes[i]]);
        }

        var today = new Date();
        var todayDate = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);

        Highcharts.stockChart('container', {
          subtitle: {
              text: '<a class="polygon-link" href="https://polygon.io/" target="_blank">Source: Polygon.io</a>'
          },
          rangeSelector: {
            buttons: [{
                type: 'day',
                count: 7,
                text: '7d'
            }, {
                type: 'day',
                count: 15,
                text: '15d'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            }, {
                type: 'month',
                count: 3,
                text: '3m'
            }, {
                type: 'month',
                count: 6,
                text: '6m'
            }],
            selected: 0,
            inputEnabled: false
          },
          title: {
            text: 'Stock Price ' + query + ' ' + todayDate
          },
          yAxis: [  {
                      opposite: false,
                      labels: {
                          align: 'right',
                          x: -30  
                      },
                      title: {
                          text: 'Stock Price'
                      },
                      tickAmount: 6
                    }, {
                      opposite: true,
                      labels: {
                          align: 'left',
                          x: 30
                      },
                      title: {
                          text: 'Volume'
                      },
                      tickAmount: 6,
                      max: 2 * maxVolume
                    } 
                  ],
          series: [{
              type: 'area',
              name: query,
              data: stockPriceVsDate,
              yAxis: 0,
              tooltip: {
                valueDecimals: 2
              },
              fillColor: {
                  linearGradient: {
                      x1: 0,
                      y1: 0,
                      x2: 0,
                      y2: 1
                  },
                  stops: [
                      [0, Highcharts.getOptions().colors[0]],
                      [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                  ]
                },
                threshold: null
              }, {
              type: 'column',
              name: 'Volume',
              data: volumeVsDate,
              yAxis: 1,
              color: '#00000',
              pointWidth: 5
          }],
          plotOptions: {
            series: {
              pointPlacement: 'on'
            }
          }
        });
      })();
    })
    .catch(error => console.error('Error:', error));
  }

  if(!missingResult) {
    const url_nw = `/search-nw?query=${query}`;

    fetch(url_nw)
    .then(response => response.text())
    .then(data => {
      var parsedData = JSON.parse(data);
      const companyNews = parsedData.company_news;
      console.log(companyNews)
      console.log(companyNews.length)

      let displayedArticles = 0;

      for (let j = 0; j < companyNews.length && displayedArticles < 5; j++) {
        const article = companyNews[j];
        if (article.image && article.datetime && article.headline && article.url) {
            const companyNewsId = "companyNews" + displayedArticles;
            document.getElementById(companyNewsId).style.display = "block";
            const companyNewsImgId = "companyNewsImage" + displayedArticles;
            const titleId = "title" + displayedArticles;
            const dateId = "date" + displayedArticles;
            const linkId = "linkToOriginalPost" + displayedArticles;

            document.getElementById(companyNewsImgId).src = article.image;
            document.getElementById(titleId).innerText = article.headline;

            const dateObject = new Date(article.datetime * 1000);
            const day = dateObject.getDate();
            const month = dateObject.toLocaleString('en-US', { month: 'long' });
            const year = dateObject.getFullYear();
            const formattedDate = `${day} ${month}, ${year}`;
            
            document.getElementById(dateId).innerText = formattedDate;

            document.getElementById(linkId).href = article.url;

            displayedArticles++;
        }
      }

      for (let i = displayedArticles; i < 5; i++) {
          const companyNewsId = "companyNews" + i;
          document.getElementById(companyNewsId).style.display = "none";
      }
    })
    .catch(error => console.error('Error:', error));
  }

});