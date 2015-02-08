/* jshint undef: false, unused: false, strict: false */
var width = 1280,
    height = 700;
dlrm.controller('AbilityCtrl', function($scope, $http, skillFactory) {
    $scope.skillTooltip = {};
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return '<div><label class=\'d3-tip-label\'>ID </label> :  <span class=\'d3-tip-value\'>' + d.skill.id + '</span></div><br>' +
                '<div><label class=\'d3-tip-label\'>Name </label> :  <span class=\'d3-tip-value\'>' + d.skill.name + '</span></div><br>' +
                '<div><label class=\'d3-tip-label\'>Level </label> :  <span class=\'d3-tip-value\'>' + d.skill.level + '</span></div><br>' +
                '<div><label class=\'d3-tip-label\'>Description </label> :  <span class=\'d3-tip-value\'>' + d.skill.description + '</span></div>';
        });

    var force = d3.layout.force()
        .linkDistance(200)
        .gravity(0.06)
        .charge(-150)
        // .chargeDistance(0)
        .friction(0)
        .size([width *= 2 / 3, height *= 2 / 3]);

    var svg = d3.select('#ability').append('svg:svg')
        .attr('width', width)
        .attr('height', height);
    svg.call(tip);

    var skillPolygonData = [{
        r: 40,
        x: 250,
        y: 100,
        id: 'spd',
        percent: 50,
        sw: 2,
        stroke: '#fff',
        fill: '#161616',
        filter: 'drop-shadow( 5px 5px 5px #fff )'
    }];

    var skillPolygonOverlayData = [{
        r: 40,
        x: 250,
        y: 100,
        id: 'spdo',
        sw: 0,
        stroke: '#161616',
        fill: '#161616',
        filter: 'drop-shadow( 5px 5px 5px #fff )'
    }];

    var pulseData = [
        [{
            r1: 40,
            r2: 47,
            r: 40,
            x: 250,
            y: 100,
            id: 'polyPulse1',
            duration1: 1000,
            duration2: 0,
            stroke: '#fff',
            sw: 1.5,
            sw1: 1.5,
            sw2: 0,
            fill: 'none'
        }],
        [{
            r1: 50,
            r2: 57,
            r: 50,
            x: 250,
            y: 100,
            id: 'polyPulse2',
            duration1: 1000,
            duration2: 0,
            stroke: '#fff',
            sw: 1.5,
            sw1: 1.5,
            sw2: 0,
            fill: 'none'
        }]
    ];

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

    $http.get('assets/json/skills.json').success(function(data) {
        var sf = skillFactory.loadSkills(data, pulseGenericData);
        createfilter(svg);
        drawGraph(sf);
    });

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

        function mouseOverSkill(d, i) {
            fade(svg, i, 0.1, false);
            pulsatePolygon(svg, d.skill.pulseData[0], 'pp1');
            pulsatePolygon(svg, d.skill.pulseData[1], 'pp2');
            tip.show(d);
        }

        function mouseOutSkill(d, i) {
            fade(svg, i, 1, true);
            svg.select('#' + d.skill.pulseData[0][0].id).remove();
            svg.select('#' + d.skill.pulseData[1][0].id).remove();
            tip.hide(d);
        }

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

    function drawSkillFactory(sf) {
        var skills = sf.skills;
        var svg = d3.select('svg');
        createfilter(svg);
        var i = 0;
        $.each(skills, function(id, skill) {
            skillFactory.updateSkillXY(skill, sf.nodes[i].x, sf.nodes[i].y);
            var partialHexagon = drawPartialHexagon(svg, skill.skillPoly, '30');
            var skillPolygonOverlay = drawHexagon(svg, skill.overlayPoly);
            d3.select('#' + skill.overlayPoly[0].id).on('mouseover', function() {
                    pulsatePolygon(svg, skill.pulseData[0], '30');
                    pulsatePolygon(svg, skill.pulseData[1], '30');
                })
                .on('mouseout', function() {
                    svg.select('#' + skill.pulseData[0][0].id).remove();
                    svg.select('#' + skill.pulseData[1][0].id).remove();
                });
            i++;
        });
    }


});
