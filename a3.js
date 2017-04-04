function createTripsMap(divId, usMap, tripsData) {
    
 // took refference and some code from http://codepen.io/dakoop/pen/YqZJGr   
  var width = 960,
    height = 500;

  var svg = d3.select(divId).append("svg")
    .attr("width", width)
    .attr("height", height);

  var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);
    
 
 var stateabbrv = usMap.features.map(function (d) {
                return d.properties.abbrv;
            });
          
 var columnData = stateabbrv.map(function(d) {
    
 var tripscount = tripsData.results.filter(function (f) {
        return f['state'] === d;
        });
        
   return tripscount.length;
 
 });
 
 var colExtent = d3.extent(d3.values(columnData));
     
   var color = d3.scale.linear()
      .domain(colExtent)
      .range(["rgb(255,255,204)", "rgb(0,104,55)"])
      .interpolate(d3.interpolateHcl);
 
  
   var states = svg.append("g")
    .selectAll("path")
    .data(usMap.features)
    .enter().append("path")
    .attr("d", path);

  
    states.attr("class", "state-boundary")
      .style("fill", function(d,i) {
        return color(columnData[i]);
      })
 

  var legendSize = 150;
  var numLevels = 150;
  
  var legend = svg.append("g").attr("class", "YlGn");
  var levels = legend.selectAll("levels")
    .data(d3.range(numLevels))
    .enter().append("rect")
    .attr("x", function(d) {
      return width - legendSize - 20 +
        d * legendSize / numLevels;
    })
    .attr("y", height - 20)
    .attr("width", legendSize / numLevels)
    .attr("height", 16)
    .style("stroke", "none");

 
    levels.style("fill", function(d) {
      return color(colExtent[0] * (legendSize - d) / legendSize +
        colExtent[1] * d / legendSize);
    })
 
  legend.append("text")
    .attr("x", width - legendSize - 20)
    .attr("y", height - 24)
    .attr("text-anchor", "middle")
    .text(colExtent[0])

  legend.append("text")
    .attr("x", width - 20)
    .attr("y", height - 24)
    .attr("text-anchor", "middle")
    .text(colExtent[1])

  legend.append("text")
    .attr("x", width - legendSize / 2 - 20)
    .attr("y", height - 40)
    .attr("text-anchor", "middle")
    .text("number of visits")

}

function createMostvisitedCityMap(divId, usMap, tripsData){
    var width = 1500,
    height = 700;

  var svg = d3.select(divId).append("svg")
    .attr("width", width)
    .attr("height", height);

  var projection = d3.geo.albersUsa()
    .scale(1500)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
    .projection(projection);
    
    
  var stopsarray = tripsData.results.map(function (d) {
                return d.stops;
            });
 
  // merge multi dimention array into an array : http://stackoverflow.com/questions/10865025/merge-flatten-a-multidimensional-array-in-javascript  
   var mergedstops = [].concat.apply([], stopsarray);

// nest function reffrence http://bl.ocks.org/phoebebright/raw/3176159/    
   var groupByCityname = d3.nest()
        .key(function(d) { return d.placeid; })
        .rollup(function(v) { return {
          count: v.length,
          city: v[0]['city'],
          lat: v[0]['lat'],
          lng: v[0]['lng']
        }; })
        .entries(mergedstops).sort(function(x, y){
        return d3.descending(x.values.count, y.values.count);
        }).slice(0, 10);

  
        svg.selectAll("path")
                .data(usMap.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", "white")
                .style("stroke", "black");

    console.log(usMap.features);
      svg.selectAll("circle")
		.data(groupByCityname)
                .enter()
		.append("circle")
		.attr("cx", function (d) { return  projection([d.values.lng, d.values.lat])[0]; })
		.attr("cy", function (d) { return  projection([d.values.lng, d.values.lat])[1]; })
		.attr("r", "4px")
		.attr("fill", "red")
        
         svg.selectAll("text")
		.data(groupByCityname)
                .enter()
                .append("text")
                .attr("dx", function(d){ return projection([d.values.lng, d.values.lat])[0];})
                .attr("dy", function(d){ return projection([d.values.lng, d.values.lat])[1];})
                .text(function(d){return d.values.city});
                

    }
    
    
function createForceLayout(divId, tripsData, CitySimilarity)
{
    
  // take reffrence and code from : https://github.com/alignedleft/d3-book/blob/master/chapter_11/04_force.html  
    var w = 960;
    var h = 500;   
    
   var stopsarray = tripsData.results.map(function (d) {
                return d.stops;
            });
    
   var merged = [].concat.apply([], stopsarray);
                      
     var groupByCityname = d3.nest()
        .key(function(d) { return d.placeid; })
        .rollup(function(v) { return {
          count: v.length,
          city: v[0]['city'],
          state: v[0]['state']
        }; })
        .entries(merged).sort(function(x, y){
        return d3.descending(x.values.count, y.values.count);
        }).slice(0, 10);
         
   
    var nodesarr = [];
    var edgesarr = [];
    var processarr = [];
 
    
    for(var i=0; i<groupByCityname.length; i++)
    {
      nodesarr.push({ name: groupByCityname[i].values.city});  
    }
    
     
    for(var i=0; i<groupByCityname.length; i++)
    {
          
      for(var j=0; j<groupByCityname.length; j++){
          
        if(i!==j){
           
            processarr.push(groupByCityname[i].values);
            processarr.push(groupByCityname[j].values);

            processarr.sort(function(x, y){
               return d3.ascending(x.city, y.city);
               });

            var a = processarr[0].city+", "+processarr[0].state+":"+processarr[1].city+", "+processarr[1].state; 
            
            edgesarr.push({ source: i, target: j, value: 60*CitySimilarity[a] });   
            processarr = [];

         }
        
       }   
                       
    }

            var force = d3.layout.force()
                        .nodes(nodesarr)
                        .links(edgesarr)
                        .linkStrength(function(d){ return d.value;})
                        .size([w, h])
                        .linkDistance([200])
                        .charge([-100])
                        .start();

            var colors = d3.scale.category10();

            var svg = d3.select(divId)
                     .append("svg")
                     .attr("width", w)
                     .attr("height", h);

            var edges = svg.selectAll("line")
                     .data(edgesarr)
                     .enter()
                     .append("line")
                     .style("stroke", "#ccc")
                     .style("stroke-width", 1);

            var plot = svg.selectAll("circle")
                     .data(nodesarr)
                     .enter();

            var nodes = plot
                    .append("circle")
                    .attr("r", 10)
                    .style("fill", function(d, i) {
                            return colors(i);
                    })
                    .call(force.drag);

            var nodeslable = plot
                    .append("text")
                    .attr("dx", 9)
                    .attr("dy", ".20em")
                    .text(function(d) { return d.name; });

            force.on("tick", function() {
                    edges.attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });

                    nodes.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });

                    nodeslable.attr("x", function(d) { return d.x; })
                        .attr("y", function(d) { return d.y; });

            }); 
}


function createHeatMap(divId,tripsData){
    
    
    // took reffrence and code from :  //http://bl.ocks.org/tjdecke/5558084
     var margin = { top: 50, right: 0, bottom: 100, left: 130 },
          width = 800 - margin.left - margin.right,
          height = 850 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 24),
          legendElementWidth = gridSize*2,
          buckets = 9,
          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
          statesarr = ["IA", "NH", "SC"];
          
          
          
         var cadidat = tripsData.results.map(function (data) {
                    return data.candidate;
                });
  // to remove duplicate entries : http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
        var candarr = cadidat.filter(function(a, b) {
                    return cadidat.indexOf(a) == b;
                })
                          
          
         
          
    var svg = d3.select(divId).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(candarr)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")");

      var timeLabels = svg.selectAll(".timeLabel")
          .data(statesarr)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)");

      
     var mydata = [];
      for(var i=0; i<candarr.length; i++)
    {     
        for(var j=0; j<statesarr.length; j++){
          
  
        var candsvisits = tripsData.results.filter(function (d) {
               if(d['candidate'] === candarr[i] && d.state === statesarr[j]) {  
                   return true;
               }
              
            });
                       
              mydata.push({ candidate: i, state: j, visits: candsvisits.length }); 
             
        }
        
    }   
                       
    
    
          var colorScale = d3.scale.quantile()
              .domain([0, buckets - 1, d3.max(mydata, function (d) { return d.visits; })])
              .range(colors);

          var cards = svg.selectAll(".hour")
              .data(mydata, function(d) {return d.candidate+':'+d.state;});

          cards.append("title");

          cards.enter().append("rect")
              .attr("x", function(d) { return 30+(d.state - 1) * gridSize; })
              .attr("y", function(d) { return 30+(d.candidate - 1) * gridSize; })
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridSize)
              .attr("height", gridSize)
              .style("fill", colors[0]);

          cards.transition().duration(1000)
              .style("fill", function(d) { return colorScale(d.visits); });

          cards.select("title").text(function(d) { return d.visits; });
          
          cards.exit().remove();

          var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function(d) { return d; });

          legend.enter().append("g")
              .attr("class", "legend");

          legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

          legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + gridSize);

          legend.exit().remove();

       
   
}

function processData(errors, tripsData, usMap, CitySimilarity) {
  createTripsMap("#census", usMap, tripsData);
  createMostvisitedCityMap("#mvcity", usMap, tripsData);
  createForceLayout("#myforce", tripsData, CitySimilarity);
  createHeatMap("#heatmap", tripsData);
}

queue()
  .defer(d3.json, "http://www.cis.umassd.edu/~dkoop/dsc530/a3/trips.json")
  .defer(d3.json, "http://www.cis.umassd.edu/~dkoop/dsc530/a3/us-states.geojson")
  .defer(d3.json, "http://www.cis.umassd.edu/~dkoop/dsc530/a3/city-similarities.json")
  .await(processData);