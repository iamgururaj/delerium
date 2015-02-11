/* jshint undef: false, unused: false, strict: false */
dlrm.factory('skillFactory', ['$http', function($http) {
    var skillFactory = {
        skills: {},
        nodes: [],
        links: []
    };
    return {
        updateSkill: function(id, level, name, iconpath, description) {
            if (level) {
                var glow = level / 100;
                skillFactory.skills[id].level = level;
                skillFactory.skills[id].boxShadow = {
                    'box-shadow': '0px 5px 2px rgba(200, 200, 200, ' + glow + '), 0px 12px 40px rgba(255, 255, 255, ' + glow + '), 0px -5px 10px rgba(255, 255, 255, 0.1) inset, 0px 0px 5px rgba(255, 255, 255, 0.8), 0px 1px 3px rgba(255, 255, 255, 1)'
                };
            }
            skillFactory.skills[id].name = name ? name : skillFactory.skills[id].name;
            skillFactory.skills[id].iconpath = iconpath ? iconpath : skillFactory.skills[id].iconpath;
            skillFactory.skills[id].description = description ? description : skillFactory.skills[id].description;
        },
        bulkUpdate: function(updatedSkills) {
            $.each(updatedSkills, function(i, o) {
                this.updateSkill(o.id, o.level, o.name, o.iconpath, o.description);
            });
        },
        updateSkillXY: function(skill, x, y){
            skill.skillPoly[0].x = x; skill.skillPoly[0].y = y;
            skill.overlayPoly[0].x = x; skill.overlayPoly[0].y = y;
            skill.pulseData[0][0].x = x; skill.pulseData[0][0].y = y;
            skill.pulseData[1][0].x = x; skill.pulseData[1][0].y = y;
        },
        loadSkills: function(data, pgd) {
            $.each(data, function(i, skill) {
                skillFactory.skills[skill.id] = skill;
                var node = {
                    'name': skill.name,
                    'r': pgd.radius,
                    'stroke': 0.5,
                    'fill': pgd.fill,
                    'skill': skill
                };
                if(skill.x){
                    node.x = skill.x;
                    node.y = skill.y;
                    node.fixed = true;
                }
                skillFactory.nodes.push(node);
                $.each(skill.dependant, function(k, o) {
                    skillFactory.links.push({
                        'source': i,
                        'target': o
                    });
                });
                skill.skillPoly = [{
                    r: pgd.radius,
                    x: pgd.x,
                    y: pgd.y,
                    id: 'spd' + skill.id,
                    percent: skill.level,
                    sw: 2,
                    stroke: pgd.stroke,
                    fill: pgd.fill,
                    filter: 'drop-shadow( 5px 5px 5px #fff )'
                }];
                skill.overlayPoly = [{
                    r: pgd.radius,
                    x: pgd.x,
                    y: pgd.y,
                    id: 'spdo' + skill.id,
                    sw: 0,
                    stroke: pgd.fill,
                    fill: pgd.fill
                }];
                skill.pulseData = [
                    [{
                        r1: pgd.radius,
                        r2: pgd.radius + 7,
                        r: pgd.radius,
                        x: pgd.x,
                        y: pgd.y,
                        id: 'polyPulse1' + skill.id,
                        duration1: pgd.duration,
                        duration2: 0,
                        stroke: pgd.stroke,
                        sw: pgd.strokeWidth,
                        sw1: pgd.strokeWidth,
                        sw2: 0,
                        fill: 'none'
                    }],
                    [{
                        r1: pgd.radius + 10,
                        r2: pgd.radius + 17,
                        r: pgd.radius + 10,
                        x: pgd.x,
                        y: pgd.y,
                        id: 'polyPulse2' + skill.id,
                        duration1: pgd.duration,
                        duration2: 0,
                        stroke: pgd.stroke,
                        sw: pgd.strokeWidth,
                        sw1: pgd.strokeWidth,
                        sw2: 0,
                        fill: 'none'
                    }]
                ];
                pgd.x += 200;
            });
            return skillFactory;
        },
        getSkills: function() {
            return skillFactory;
        }
    };
}]);
