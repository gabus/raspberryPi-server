$(function () {
  generateReq();
  getTotals();
});
$('#time-range').change(function () {
  GlobalLineChartObj.destroy();
  generateReq();
});
$('#refresh').click(function () {
  GlobalLineChartObj.destroy();
  generateReq();
});


function generateReq() {
  var since = calculateTime($('#time-range').val());
  return getStats(since, new Date().getTime());
}


function calculateTime(dateString) {
  var currentDate = new Date();
  switch (dateString) {
    case '5h':
      return currentDate.setHours(currentDate.getHours() - 5);
    case '12h':
      return currentDate.setHours(currentDate.getHours() - 12);
    case '24h':
      return currentDate.setHours(currentDate.getHours() - 24);
    case '2d':
      return currentDate.setDate(currentDate.getDate() - 2);
    case '3d':
      return currentDate.setDate(currentDate.getDate() - 3);
    case '5d':
      return currentDate.setDate(currentDate.getDate() - 5);
    case '1w':
      return currentDate.setDate(currentDate.getDate() - 7);
    default:
      console.log('no such day available');
      break;
  }
  return new Date(dateString).getTime();
}


function getStats(since, until) {
  $.ajax({
    url: 'http://52.50.54.31:3001?since=' + since + '&until=' + until,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    success: function (response) {
      var currentTemp = (response[response.length -1].temperature / 1000).toFixed(1);
      $('#currentTemp').text(currentTemp + ' °C');
      $('title').text(currentTemp + ' °C');
      var daysIndex = [];
      var dates = [];
      response.map(function(bla, index) {
        var date = bla.date.slice(8, 10); // 2016-02-13T19:32:55.012Z
        if(dates.indexOf(date) == -1) {
          dates.push(date);
          daysIndex.push({'index': index, 'date': date});
        }
      });

      var data = {
        labels: response.map(function (bla) {
          var date = bla.date.slice(8, 16); // 2016-02-13T19:32:55.012Z
          return date.replace('T', 'd ');
        }),
        datasets: [
          {
            label: "Room temperature",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: response.map(function (bla) {
              return (bla.temperature / 1000).toFixed(2)
            })
          }
        ]
      };

      var ctx = $("#myChart").get(0).getContext('2d');


      Chart.types.Line.extend({
        name: "LineWithLine",
        draw: function () {
          Chart.types.Line.prototype.draw.apply(this, arguments);

          for(var i = 0; i < this.options.lineAtIndex.length; i++) {
            var point = this.datasets[0].points[this.options.lineAtIndex[i].index];
            var scale = this.scale;

            // draw line
            this.chart.ctx.beginPath();
            this.chart.ctx.moveTo(point.x, scale.startPoint + 24);
            this.chart.ctx.strokeStyle = '#ff0000';
            this.chart.ctx.lineTo(point.x, scale.endPoint);
            this.chart.ctx.stroke();

            // set line value
            this.chart.ctx.textAlign = 'center';
            this.chart.ctx.fillText(this.options.lineAtIndex[i].date, point.x, scale.startPoint + 12);
          }

        }
      });


      var ChartObj = new Chart(ctx);
      GlobalLineChartObj = ChartObj.LineWithLine(data, {
//                    datasetFill : false,
        lineAtIndex: daysIndex
      });
    },
    error: function (err) {
      console.log(err);
    }
  });
}


function getTotals() {
  $.ajax({
    url: 'http://52.50.54.31:3001/getTotals',
    method: 'GET',
    success: function(data) {
      var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      data.map(function(oneData) {
        var date = new Date(oneData._id.year + '-' + oneData._id.month)

        $('#monthlyStats').append(
          '<tr>'
          + '<td>' + date.getFullYear() + ' ' + months[date.getMonth()] + '</td>'
          + '<td>' + (oneData.average / 1000).toFixed(2) + '</td>'
          + '<td>' + oneData.min / 1000 + '</td>'
          + '<td>' + oneData.max / 1000 + '</td>'
          + '</tr>'
        );
      })
    },
    error: function(err) {
      console.log(err);
    }
  });
}