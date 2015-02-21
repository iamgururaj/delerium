/* jshint undef: false, unused: false, strict: false */

angular
    .module('deleriumApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngBackstretch'
    ])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/main', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/abilities', {
                templateUrl: 'views/abilities.html',
                controller: 'AbilityCtrl'
            })
            .otherwise({
                redirectTo: '/main.html'
            });
    });

/*
Returns Point P3 inbetween two given point P1 and P2 which is at a distance delta from P1
*/
function getPoint(p1, p2, delta) {
    var a = p1.x,
        b = p1.y,
        c = p2.x,
        d = p2.y;
    var DT = Math.sqrt(Math.pow((c - a), 2) + Math.pow((d - b), 2));
    var D = delta * DT;
    var DDT = D / DT;
    var x = (1 - DDT) * a + DDT * c;
    var y = (1 - DDT) * b + DDT * d;
    return {
        x: x,
        y: y
    };
}

/*
Draw a SVG line using d3 data d, d.x, d.y represent the endings of each line.
 */
function drawLine() {
    return d3.svg.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        });
}

/*
Generates Polygon points given sides of polygon(for hexagon its 6 which is used in app),
r - radius of polygon from center to any one corner
x, y - Offset points in the svg
 */
function polyPoints(n, x, y, r) {
    var points = [];
    var angle = 45;
    for (i = 0; i < n; i++) {
        points.push({
            x: x + r * Math.cos(2 * Math.PI * i / n),
            y: y + r * Math.sin(2 * Math.PI * i / n)
        });
    }
    points.push(points[0]);
    return points;
}

/*
Gets the centroid of a d3 selected polygon
*/
function getCentroid(selection) {
    var bbox = selection.getBBox();
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}


/**
 * [Generates partial polygon points based on skill percentage]
 * @param  {[number]} n [number of sides]
 * @param  {[float]} x [offset position along x axis]
 * @param  {[float]} y [offset position along y axis]
 * @param  {[number]} t [skill level in percentage]
 * @param  {[number]} r [radius of the polygon]
 */
function partialPolyPoints(n, x, y, t, r) {
    var points = polyPoints(n, x, y, r),
        tPoints = [],
        side = 100 / 6;
    for (i = 0; i <= 6; i++) {
        if (i === 0 && t > side) {
            tPoints.push(points[i]);
        } else if (i !== 0 && t > 0) {
            tPoints.push(points[i]);
        } else if (i === 0 && t < side) {
            tPoints.push(points[i]);
            var initDelta = t / side;
            tPoints.push(getPoint(points[i], points[i + 1], initDelta ? initDelta : 0.0001));
            break;
        } else {
            var delta = ((side + t) / side);
            var toPoint = points[i + 1] ? points[i + 1] : points[i - 1];
            var fromPoint = points[i];
            delta = delta < 1 ? 1 : delta;
            tPoints.push(getPoint(toPoint, fromPoint, delta));
            break;
        }
        t -= side;
    }
    return tPoints;
}

/*
Draws hexagon using d3 line generator and polygon points generated using above polyPoints function
 */
function hexagonPath(n, x, y, r) {
    return drawLine()((polyPoints(n, x, y, r)));
}

/*
Draws Partial hexagon using d3 line generator and polygon points generated using above polyPoints function
 */
function partialHexagonPath(n, x, y, percent, r) {
    return drawLine()((partialPolyPoints(n, x, y, percent, r)));
}

/*
Draws hexagon using d3 line generator and sets the stroke, storke-width and fill attributes of the hexagon
 */
function drawHexagon(svg, data) {
    return svg.append('g')
        .selectAll('path')
        .data(data)
        .enter().append('path').attr('id', function(d) {
            return d.id;
        })
        .attr('d', function(d) {
            return hexagonPath(6, d.x, d.y, d.r);
        })
        .attr('stroke', function(d) {
            return d.stroke;
        })
        .attr('stroke-width', function(d) {
            return d.sw;
        })
        .attr('fill', function(d) {
            return d.fill;
        });
}

/*
Transparent overlay hexagaon for mouseover and mouseout events
 */
function drawTransparentHexagon(svg, data) {
    return svg.append('g')
        .selectAll('path')
        .data(data)
        .enter().append('path').attr('id', function(d) {
            $('#T'+d.id).parent().remove();
            return 'T' + d.id;
        })
        .attr('d', function(d) {
            return hexagonPath(6, d.x, d.y, d.r);
        })
        .attr('fill', function(d) {
            return d.fill;
        }).attr('fill-opacity', function(d) {
            return '0';
        });
}

function drawBackFillHexagon(svg, data) {
    return svg.append('g')
        .selectAll('path')
        .data(data)
        .enter().append('path').attr('id', function(d) {
            $('#BF'+d.id).parent().remove();
            return 'BF' + d.id;
        })
        .attr('d', function(d) {
            return hexagonPath(6, d.x, d.y, d.r);
        })
        .attr('fill', function(d) {
            return '#000000';
        }).attr('fill-opacity', function(d) {
            return '1';
        });
}

/*
Draws partial hexagon using d3 line generator and sets the stroke, storke-width and fill attributes of the hexagon
 */
function drawPartialHexagon(svg, data) {
    return svg.append('g')
        .selectAll('path')
        .data(data)
        .enter().append('path').attr('id', function(d) {
            $('#'+d.id).parent().remove();
            return d.id;
        })
        .attr('d', function(d) {
            return partialHexagonPath(6, d.x, d.y, d.percent, d.r);
        })
        .attr('stroke', function(d) {
            return d.stroke;
        })
        .attr('stroke-width', 2)
        .attr('filter', function(d) {
            return 'url(#dropshadow)';
        });
}

/*
Hexagon pulse generator function. Pulse displayed on mouse hover.
 */
function pulsatePolygon(svg, dataArray) {
    var data = dataArray[0];

    function pulse() {
        var poly = d3.select('path#' + data.id);

        function repeat(data) {
            poly = poly.transition()
                .duration(data.duration1)
                .attr('d', hexagonPath(6, data.x, data.y, data.r2))
                .attr('stroke', data.stroke)
                .attr('stroke-width', data.sw2);
            poly = poly.transition()
                .duration(data.duration2)
                .attr('stroke-width', data.sw1)
                .attr('stroke', data.stroke)
                .attr('d', hexagonPath(6, data.x, data.y, data.r1));
            poly = poly.ease('linear')
                .each('end', repeat);
        }
        repeat(data);
    }
    return drawHexagon(svg, dataArray).each(pulse);
}

/*
Draws d3 circle using center cx, cy, radius - r and data. Not used in the app
 */
function makeCircle(svg, data, id, sw, r, cx, cy) {
        return svg.append('g')
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('id', id)
            .attr('stroke-width', sw)
            .attr('r', r)
            .attr('cx', cx)
            .attr('cy', cy);
    }
    /*
    Draws d3 circle pulse generator using center cx, cy, radius - r1, r2, duration - duration duration1, duration2 and data. Not used in the app
     */
function pulsate(svg, data, id, sw1, r1, cx, cy, sw2, r2, duration1, duration2) {
    function pulse() {
        var circle = d3.select('circle#' + id);
        (function repeat() {
            circle = circle
                .transition()
                .duration(duration1)
                .attr('stroke-width', sw2)
                .attr('r', r2);
            circle = circle
                .transition()
                .duration(duration2)
                .attr('stroke-width', sw1)
                .attr('r', r1);
            circle = circle
                .ease('sine')
                .each('end', repeat);
        })();
    }
    makeCircle(svg, data, id, sw1, r1, cx, cy).each(pulse);
}

/*
Creates glow filter around hexagon
 */
/*function createfilter(svg) {
    var defs = svg.append('defs');
    var filter = defs.append('filter')
        .attr('id', 'dropshadow');
    filter.append('feGaussianBlur')
        .attr('out', 'SourceGraphic')
        .attr('stdDeviation', '1')
        .attr('result', 'glow');
    filter.append('feOffset')
        .attr('out', 'blur')
        .attr('dx', 2)
        .attr('dy', 2)
        .attr('result', 'glow');
    filter.append('feColorMatrix')
        .attr('result', 'matrixOut')
        .attr('in', 'offOut')
        .attr('type', 'matrix')
        .attr('values', '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
    var feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'glow');
    feMerge.append('feMergeNode')
        .attr('in', 'glow');
    feMerge.append('feMergeNode')
        .attr('in', 'glow');
        feMerge.append('feMergeNode')
        .attr('in', 'glow');
}*/
function createfilter(svg) {
    var defs = svg.append('defs');
    var filter = defs.append('filter')
        .attr('id', 'dropshadow');
    filter.append('feGaussianBlur')
        .attr('stdDeviation', '3')
        .attr('result', 'glow');
    var feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');
}

/*
Checks whether the nodes collide with each other. If so generate a different offset point
 */
function collide(node) {
    var r = node.radius + 16,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * 0.5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}

/*
Draws square with image. The images set in the center of the hexagon for each skill
 */
function drawSquareWithImage(element, x, y, length, fillUrl, id) {
    $('#'+id).remove();
    var d = element.append('rect')
        .attr('x', x - length / 2)
        .attr('y', y - length / 2)
        .attr('width', length)
        .attr('height', length)
        .attr('id', id);
    d = fillUrl ? d.attr('fill', fillUrl) : d;
    return d;
}

/*
SVG pattern image used to set image of each skill
 */
function patternImage(element, id, href) {
    var def = element.select('defs');
    def.append('pattern')
        .attr('id', 'img' + id)
        .attr('patternContentUnits', 'objectBoundingBox')
        .attr('width', '100%')
        .attr('height', '100%')
        .append('image')
        .attr('xlink:href', href)
        .attr('preserveAspectRatio', 'none')
        .attr('width', 1)
        .attr('height', 1);
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

/*
On hover over a skills. Highlights, animates the node links to other skills in the affected direction. The skill links which are not
impacted will be made transparent
 */
function fade(svg, i, opacity, stop) {
    svg.selectAll('.link')
        .filter(function(d) {
            // return d.source.index !== i && d.target.index !== i;
            return true;
        })
        .transition()
        .style('opacity', opacity);

    var activeLinks = svg.selectAll('.link')
        .filter(function(d) {
            return d.source.index === i || d.target.index === i;
        });
    if (!stop) {
        activeLinks.transition()
            .duration(1000)
            .attr('x2', function(d) {
                return d.source.x;
            }).attr('y2', function(d) {
                return d.source.y;
            })
            .each('end', repeat);

        function repeat() {
            activeLinks.attr('x2', function(d) {
                    return d.source.x;
                }).attr('y2', function(d) {
                    return d.source.y;
                })
                .style('opacity', opacity)
                .attr('marker-end', 'url(#aend)')
                .transition()
                .duration(1000)
                .ease('linear')
                .attr('x2', function(d) {
                    return d.target.x;
                }).attr('y2', function(d) {
                    return d.target.y;
                })
                .style('opacity', 1)
                .attr('marker-end', 'url(#end)')
                .each('end', repeat);
        }
        repeat();
    } else {
        activeLinks.transition()
            .duration(0).attr('x2', function(d) {
                return d.target.x;
            }).attr('y2', function(d) {
                return d.target.y;
            })
            .style('opacity', 1)
            .attr('marker-end', 'url(#end)');
    }
}
