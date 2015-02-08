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

function drawLine() {
    return d3.svg.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        });
}

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

function getCentroid(selection) {
    var bbox = selection.getBBox();
    return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
}

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
            console.log(fromPoint, toPoint);
            delta = delta < 1 ? 1 : delta;
            tPoints.push(getPoint(toPoint, fromPoint, delta));
            break;
        }
        t -= side;
    }
    return tPoints;
}

function hexagonPath(n, x, y, r) {
    return drawLine()((polyPoints(n, x, y, r)));
}

function partialHexagonPath(n, x, y, percent, r) {
    return drawLine()((partialPolyPoints(n, x, y, percent, r)));
}

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

function drawTransparentHexagon(svg, data) {
    return svg.append('g')
        .selectAll('path')
        .data(data)
        .enter().append('path').attr('id', function(d) {
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

function drawPartialHexagon(svg, data) {
    return svg.append('g')
        .selectAll('path')
        .data(data)
        .enter().append('path').attr('id', function(d) {
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

function createfilter(svg) {
    var defs = svg.append('defs');
    var filter = defs.append('filter')
        .attr('id', 'dropshadow');
    filter.append('feGaussianBlur')
        .attr('out', 'SourceAlpha')
        .attr('stdDeviation', '2')
        .attr('result', 'blur');
    filter.append('feOffset')
        .attr('out', 'blur')
        .attr('dx', 2)
        .attr('dy', 2)
        .attr('result', 'offsetBlur');
    var feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
        .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');
}

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

function drawSquareWithImage(element, x, y, length, fillUrl) {
    var d = element.append('rect')
        .attr('x', x - length / 2)
        .attr('y', y - length / 2)
        .attr('width', length)
        .attr('height', length);
    d = fillUrl ? d.attr('fill', fillUrl) : d;
    return d;
}

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
