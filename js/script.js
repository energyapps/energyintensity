// Initiate pym
var pymChild = new pym.Child();

var statesGlobal = [];

//indexes, Width and height, Padding, parameters
var j = 0; // this is the index of which "type" of data we're looking at. Gross=0, PerCap=1
var StandardPadding = 20;

var w = parseInt(d3.select("#master_container").style("width"))
// var h = (AxisPaddingTop + StandardPadding/2 + ((totes)*2*r) + (totes*BubblePadding)+BubblePadding*1.5+20)

var margin = {top: 20, right: 20, bottom: 30, left: 30},
    width = w - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#master_container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseDate = d3.time.format("%Y").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");    

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .outerTickSize(0);   

d3.tsv("data/CO23.tsv", function(error, data) {
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date" && key.slice(-2) !== "01" && key.slice(-2) !== "02"  ; }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  var cities = color.domain().map(function(name) {
  	statesGlobal.push(name)
    return {
      name: name,
      values: data.map(function(d) {
      	var f = +d[name];
      	
      	// Loops and adds in other intensities!
      	for (var k in d){
      		if (k.slice(0,-2) == name && k.slice(-2) == 01 ) {
      			var g = +d[k]
      		} else if (k.slice(0,-2) == name && k.slice(-2) == 02 ) {
      			var h = +d[k]
      		}
      	}
        return {
        	date: d.date,
         	co2: f,
         	cintensity: g,
         	eintensity: h
         };
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

// put this in the update
  y.domain([
    -55,30
  ]);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height)
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .text("% Change in CO2 Emissions");

    svg
    	.append("line")
    		.attr("class","baseline")
			.attr("y1", y(0))
		  	.attr("y2", y(0))
		  	.attr("x1",0)
		  	.attr("x2",width)
		  	.attr("stroke-width","1.5")
		  	.attr("stroke","#000")
		  	.attr("stroke-opacity","0.5");

  var city = svg.selectAll(".city")
      .data(cities)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { 			   		
		var line = d3.svg.line()
		    .interpolate("basis")
		    .x(function(d) { return x(d.date); })
		    .y(function(d) { return y(d["co2"]); })

		return line(d.values)
	  })
      .attr("attribute",function(d){return d.name})
      .attr("tabID","co2")
      .style("stroke", function(d,i) { 
      	var c = 350 - (d.values[13].co2 * -3);
        // var color = "hsl(" + c + ",100%,50%)"
        var color = "#111"
        return color;        
      })
      .style("stroke-opacity","0.4")
      .on("mouseover",function(d){        	
      	Highlight(d.name)       
      })
      .on("mouseout",function(d){
        // d3.select(this).style("stroke-opacity","0.15")
      });

    d3.select('[attribute="US Average"]')
    	.style("stroke-width","5")
    	.style("stroke-opacity","1")

    svg.append("text")
    	.attr("class","highlightText")
      .attr("name",function(d){
        return cities[44].name;
      })
    	.attr("x",width)
    	.attr("y","0")
    	.text(function(d){    		
    		var type = "co2" 
    		var state = cities[44].name;
    		var amount = cities[44].values[13][type]    	
    		return state + ": " + amount + "%"
    	})


      // svg.append("text")
      //   .attr("class","highlightText2")
      //   .attr("x",width-10)
      //   .attr("y","35")
      //   .text("CO2 Emissions Change (Million Tonnes)")

 
	d3.selectAll(".tab").on("click", function() {
		d3.selectAll(".tab").attr("class","tab");
		this.className = "tab active";
		d3.select("#about_extend").attr("class","");
		d3.select("#about").attr("class","about_tab")		
		update(this.id)
	});

	d3.select("#about").on("click", function() {
		this.className = "about_tab active"			
		$("#about_extend").addClass("active");
		$("#about_extend").css("display","block");
	});

	//remove about on click out
	$(document).on('click', function(event) {
	  if (!$(event.target).closest('#about').length) {
	    // d3.select("#about_extend").attr("class","");
		d3.select("#about").attr("class","about_tab")
		$("#about_extend").css("display","none");
	  }
	});

	$('#autocompletez').autocomplete({
	    lookup: statesGlobal,
	    lookupLimit: 10,
	    maxHeight:350,
	    showNoSuggestionNotice: true,
	    noSuggestionNotice: function(){		    	
	    	return "No state found"
	    },
	    onSelect: function (suggestion) {	    	
	   		// CAll function that highlights selected line
	 		Highlight(suggestion.value)
	    }
	});		
	pymChild.sendHeight();
});
	

		function Highlight(sug) {
      var type = d3.select('[attribute="'+ sug +'"]')[0][0].attributes.tabID.value;       

			// Call d3 THIS highlight, everything else lowlight
			d3.selectAll(".line").style("stroke-opacity","0.15").style("stroke","#111")

      d3.select('[attribute="'+ sug +'"]')
        .style("stroke-opacity","0.8") 
        .style("stroke", function(d,i) { 
          var c = 350 - (d.values[13][type] * -3)
          var color = "hsl(" + c + ",100%,50%)"
          return color;        
        })    


			d3.select('[attribute="US Average"]').style("stroke-opacity","0.8")
			d3.select(".highlightText")
        .attr("name",sug)
				.text(function(d){					
					var data = d3.select('[attribute="'+ sug +'"]')[0][0].__data__;
		    		var state = data.name;
		    		var amount = data.values[13][type]    	
            if (amount > 0) {
              var plus = "+"
            } else {
              var plus = ""
            };

		    		return state + ": " + plus + amount + "%"
	    		})
			pymChild.sendHeight();
		}	

		function update(tabID) {				
			var w = parseInt(d3.select("#master_container").style("width"))

      d3.selectAll('.y.axis').remove();
      // d3.select(".baseline").remove();
      d3.selectAll(".USText").remove();

			var city = svg.selectAll(".city").selectAll("path")

      if (tabID == "co2") {
        // y.domain([
        //   -550,300
        // ]);
        var ctext = "% Change in CO2 Emissions";

      } else if (tabID == "cintensity") {
        // y.domain([
        //   -10,6
        // ]);
        var ctext = "% Change in Carbon Intensity";
      } else {
        var ctext = "% Change in Energy Intensity"
      };

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height)
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "start")
      .text(ctext);

			city.transition()
			   	.duration(1000)
				.attr("d", function(d) { 			 		
					var line = d3.svg.line()
					    .interpolate("basis")
					    .x(function(d) { return x(d.date); })
					    .y(function(d) { return y(d[tabID]); })
					return line(d.values)
				})
				.attr("tabID",tabID)
			    // .style("stroke", function(d,i) { 
			    //   	var c = 350 - (d.values[13][tabID] * -3)
			    //     var color = "hsl(" + c + ",100%,50%)"
			    //     return color;        
			    //   })		
			    // .style("stroke-opacity","0.4")

      d3.select(".highlightText")
        .text(function(d){          
          
          var name = this.attributes.name.value;            
          var data = d3.select('[attribute="'+ name +'"]')[0][0].__data__;        
            // var type = d3.select('[attribute="'+ sug +'"]')[0][0].attributes.tabID.value; 
            var state = data.name;
            var amount = data.values[13][tabID]      
            // var amount = data.values[7][tabID]    
            if (amount > 0) {
              var plus = "+"
            } else {
              var plus = ""
            };

            return state + ": " + plus + amount + "%"
          })

			pymChild.sendHeight();
		}			

// Prebaked functions
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}		