/* jshint undef: false, unused: false, strict: false */
var width = 1280,
    height = 700;
dlrm.controller('AbilityCtrl', function($scope, $http, skillFactory) {
    $scope.skillTooltip = {};
    /*
    D3 tooltip html which is displayed on hover over a skill hexagon
     */
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return '<div><label class=\'d3-tip-label\'>ID </label> :  <span class=\'d3-tip-value\'>' + d.skill.id + '</span></div><br>' +
                '<div><label class=\'d3-tip-label\'>Name </label> :  <span class=\'d3-tip-value\'>' + d.skill.name + '</span></div><br>' +
                '<div><label class=\'d3-tip-label\'>Level </label> :  <span class=\'d3-tip-value\'>' + d.skill.level + '</span></div><br>' +
                '<div><label class=\'d3-tip-label\'>Description </label> :  <span class=\'d3-tip-value\'>' + d.skill.description + '</span></div>';
        });

    /*
    d3 force layout which will holds together the hexagon skill nodes and the links between them.
    More Info: https://github.com/mbostock/d3/wiki/Force-Layout
    */
    var force = d3.layout.force()
        .linkDistance(200)
        .gravity(0.06)
        .charge(-150)
        // .chargeDistance(0)
        .friction(0)
        .size([width *= 2 / 3, height *= 2 / 3]);

    /*
    The SVG component where the rendering of the layout happens
     */
    var svg = d3.select('#ability').append('svg:svg')
        .attr('width', width)
        .attr('height', height);
    svg.call(tip);

    var pulseGenericData = {
        radius: 40,
        x: 250,
        y: 100,
        duration: 1000,
        stroke: '#fff',
        strokeWidth: 1.5,
        fill: '#161616',
        pulseId: 'polyPulse',
        skillId: 'spd',
        overlayId: 'spdo'
    };

    // Loads the skills json. Once loaded triggers the functions to draw the entire layout
    $http.get('assets/json/skills.json').success(function(data) {
        var sf = skillFactory.loadSkills(data, pulseGenericData);
        createfilter(svg);
        drawGraph(sf);
    });

    //The arrow marker design which is at the end of line.
    svg.append('svg:defs').selectAll('marker')
        .data(['end']) // Different link/path types can be defined here
        .enter().append('svg:marker') // This section adds in the arrows
        .attr('id', String)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 40)
        .attr('refY', 0)
        .attr('fill', '#fff')
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

    //Marker design for transition on mouse over.
    svg.append('svg:defs').selectAll('marker')
        .data(['aend']) // Different link/path types can be defined here
        .enter().append('svg:marker') // This section adds in the arrows
        .attr('id', String)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('fill', '#fff')
        .attr('markerWidth', 4)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

    /*
        Draws the entire layout once the skills json is loaded
    */
    function drawGraph(graph) {
        var link = svg.selectAll('.link')
            .data(graph.links)
            .enter().append('line')
            .attr('class', 'link')
            .style('stroke-width', '3');

        var node = svg.selectAll('.node')
            .data(graph.nodes)
            .enter().append('path')
            .attr('class', 'node');

        //Tick function is called when the layout is intialized. Force layout auto calculates the position of each node
        //depending on the number of skills and how the skills are linked together.
        //Dependant skills are mentioned in the dependant param of each skill.
        function tick() {
            var q = d3.geom.quadtree(node),
                i = 0,
                n = node.length;
            while (++i < n) {
                q.visit(collide(node[i]));
            }
            node.attr('cx', function(d) {
                    d.x = Math.max(d.r, Math.min(width - d.r, d.x));
                    return d.x;
                })
                .attr('cy', function(d) {
                    d.y = Math.max(d.r, Math.min(height - d.r, d.y));
                    return d.y;
                });
            link.attr('x1', function(d) {
                    return d.source.x;
                })
                .attr('y1', function(d) {
                    return d.source.y;
                })
                .attr('x2', function(d) {
                    return d.target.x;
                })
                .attr('y2', function(d) {
                    return d.target.y;
                })
                .attr('marker-end', 'url(#end)');
        }

        //Start Polygon pulse animation, show tip, Skill links animation on hover
        function mouseOverSkill(d, i) {
            fade(svg, i, 0.1, false);
            pulsatePolygon(svg, d.skill.pulseData[0], 'pp1');
            pulsatePolygon(svg, d.skill.pulseData[1], 'pp2');
            tip.show(d);
        }

        //Stops the animation on mouse out
        function mouseOutSkill(d, i) {
            fade(svg, i, 1, true);
            svg.select('#' + d.skill.pulseData[0][0].id).remove();
            svg.select('#' + d.skill.pulseData[1][0].id).remove();
            tip.hide(d);
        }

        /*Called once when the entire layout drawn is over. Once nodes are positioned the skill x,y position is uodated
         based on the calculated nodes positon, the partial hexagon is drawn depending on the skills
         percentage. The skill image is placed using patternimage. A transparent hexagon is drawn for mouseover and mouse out events.
        */
        function end() {
            node.attr('d', function(d, i) {
                    skillFactory.updateSkillXY(d.skill, d.x, d.y);
                    drawPartialHexagon(svg, d.skill.skillPoly);
                    patternImage(svg, d.skill.id, d.skill.iconpath);
                    var sq = drawSquareWithImage(svg, d.x, d.y, 35, 'url(#img' + d.skill.id + ')');
                    drawTransparentHexagon(svg, d.skill.skillPoly).on('mouseover', function() {
                            mouseOverSkill(d, i);
                        })
                        .on('mouseout', function() {
                            mouseOutSkill(d, i);
                        });
                    return hexagonPath(6, d.x, d.y, d.r);
                })
                .attr('stroke-width', '0.5');
        }
        force.nodes(graph.nodes)
            .links(graph.links)
            .on('tick', tick)
            .on('end', end)
            .start()
            .alpha(0.007);
    }

});
