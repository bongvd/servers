
function GraphShape(data) {
    if (typeof Array.isArray === 'undefined') {
        Array.isArray = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    };
    function isObject(test) {
        return typeof test === 'object';
    }
    function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }
    function getLineEquation(p0, p1) {
        let dx = p1.x - p0.x;
        let dy = p1.y - p0.y;
        let c = dx * p0.y - dy * p0.x;
        return [dy, -dx, c];
    }
    function getLineX(line, y) {
        return -line[2] / line[0] - line[1] * y / line[0];
    }
    function getLineY(line, y) {
        return -line[2] / line[1] - line[0] * y / line[1];
    }
    function getParallelLine(line, x, y) {
        let line1 = line.slice(0);
        line1[2] = -x * line1[0] - y * line1[1];
        return line1;
    }
    function getPerpendicularLine(line, x, y) {
        let line1 = line.slice(0);
        line1[0] = -line[1];
        line1[1] = line[0];
        line1[2] = line[1] * x - y * line[0];
        return line1;
    }
    function getLineIntersect(line1, line2) {
        let a1 = line1[0], b1 = line1[1], c1 = line1[2];
        let a2 = line2[0], b2 = line2[1], c2 = line2[2];
        if (a1 == 0) {
            if (a2 == 0) {
                return null;
            }
            let y = -c1 / b1;
            let x = -(b2 * y + c2) / a2;
            return { x: x, y: y };
        }
        else {
            var ms = b2 - a2 * b1 / a1;
            if (ms == 0) {
                return null;
            }
            let y = (a2 * c1 / a1 - c2) / ms;
            let x = -(b1 * y + c1) / a1;
            return { x: x, y: y };
        }

        //if (line1[0] == line2[0]) return null;
        //let x = (line1[1] - line2[1]) / (line2[0] - line1[0]);
        //let y = line1[0] * x + line1[1];
        //return { x: x, y: y };
    }
    function fitCircleToPoints(x1, y1, x2, y2, x3, y3) {
        var x, y, u;
        const slopeA = (x2 - x1) / (y1 - y2); // slope of vector from point 1 to 2
        const slopeB = (x3 - x2) / (y2 - y3); // slope of vector from point 2 to 3
        if (slopeA === slopeB) { return } // Slopes are same thus 3 points form striaght line. No circle can fit.
        if (y1 === y2) {   // special case with points 1 and 2 have same y 
            x = ((x1 + x2) / 2);
            y = slopeB * x + (((y2 + y3) / 2) - slopeB * ((x2 + x3) / 2));
        } else if (y2 === y3) { // special case with points 2 and 3 have same y 
            x = ((x2 + x3) / 2);
            y = slopeA * x + (((y1 + y2) / 2) - slopeA * ((x1 + x2) / 2));
        } else {
            x = ((((y2 + y3) / 2) - slopeB * ((x2 + x3) / 2)) - (u = ((y1 + y2) / 2) - slopeA * ((x1 + x2) / 2))) / (slopeA - slopeB);
            y = slopeA * x + u;
        }

        return {
            x, y,
            radius: ((x1 - x) ** 2 + (y1 - y) ** 2) ** 0.5,
            CCW: ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) >= 0,
        };
    }

    function getLineEllipseIntersect(line, cx, cy, a, b) {
        if (line[1] == 0) {
            if (line[0] == 0) return [];
            let x = -line[2] / line[0];
            let d = 1 - (x - cx) * (x - cx) / (a * a);
            if (d < 0) return [];
            let y1 = Math.sqrt((d) * (b * b));
            let y2 = -y1 + cy;
            y1 = y1 + cy;
            if (d == 0) {
                return [{ x: x, y: y1 }];
            }
            return [{ x: x, y: y1 }, { x: x, y: y2 }];
        }
        let m = -line[0] / line[1];
        let n1 = - line[2] / line[1];
        let n = m * cx + n1 - cy;
        let A = b * b + a * a * m * m;
        let B = m * n * a * a;
        let C = (n * n - b * b) * a * a;
        let delta = B * B - A * C;
        if (delta < 0) return [];
        if (delta == 0) {
            let x1 = -B / A + cx;
            let y1 = m * x1 + n1;
            return [{ x: x1, y: y1 }];
        }
        delta = Math.sqrt(delta);
        let x1 = (-B + delta) / A + cx;
        let y1 = m * x1 + n1;
        let x2 = (-B - delta) / A + cx;
        let y2 = m * x2 + n1;
        return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    }
    function cloneObject(obj) {
        if (obj === undefined) return null;
        if (obj === null) return null;
        if (Array.isArray(obj)) {
            var arr = [];
            for (var i = 0; i < obj.length; i++) {
                arr[i] = cloneObject(obj[i]);
            }
            return arr;
        }
        else if (isObject(obj)) {
            var clone = obj;
            for (var key of Object.keys(obj)) {
                clone[key] = cloneObject(obj[key]);
            }
            return clone;
        }
        return obj;
    }
    function vectorRotate(vec, ang) {
        ang = ang * (Math.PI / 180.0);
        let cos = Math.cos(ang);
        let sin = Math.sin(ang);
        let x = Math.round(10000 * (vec.x * cos - vec.y * sin)) / 10000;
        let y = Math.round(10000 * (vec.x * sin + vec.y * cos)) / 10000;
        return { x: x, y: y };
    }
    function vectorLength(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    function vectorNormalize(v) {
        var d = Math.sqrt(v.x * v.x + v.y * v.y);
        return { x: v.x / d, y: v.y / d };
    }
    function vectorStretch(v, l) {
        var d = Math.sqrt(v.x * v.x + v.y * v.y);
        return { x: l * v.x / d, y: l * v.y / d };
    }
    function createPie(ctx, adjustValues, rect) {
        let a0 = adjustValues[0].angleValue * Math.PI / 180;
        let a1 = adjustValues[1].angleValue * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(rect.centerX, rect.centerY);
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, a0, a1);
        ctx.closePath();
    }
    function createChord(ctx, adjustValues, rect) {
        let a0 = adjustValues[0].angleValue * Math.PI / 180;
        let a1 = adjustValues[1].angleValue * Math.PI / 180;
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, a0, a1);
        ctx.closePath();
    }
    function createTearDrop(ctx, rect) {
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, 0, 3 * Math.PI / 2);
        ctx.lineTo(rect.right, rect.y);
        ctx.closePath();
    }
    function createFrame(ctx, adjustValues, rect) {
        let d = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y);
        ctx.closePath();
        //rotate reverse clockwise
        ctx.moveTo(rect.x + d, rect.y + d);
        ctx.lineTo(rect.x + d, rect.bottom - d);
        ctx.lineTo(rect.right - d, rect.bottom - d);
        ctx.lineTo(rect.right - d, rect.y + d);
        ctx.lineTo(rect.x + d, rect.y + d);
        ctx.closePath();
    }
    function createHalfFrame(ctx, adjustValues, rect) {
        let dx = Math.min(rect.width, rect.height) * adjustValues[1].rawValue / 100000;
        let dy = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        let line = getLineEquation({ x: rect.right, y: rect.y }, { x: rect.x, y: rect.bottom });
        let x1 = getLineX(line, rect.y + dy);
        let y1 = getLineY(line, dx + rect.x);
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(x1, rect.y + dy);
        ctx.lineTo(rect.x + dx, rect.y + dy);
        ctx.lineTo(rect.x + dx, y1);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y);
        ctx.closePath();
    }
    function createLShape(ctx, adjustValues, rect) {
        let dx = rect.width - Math.min(rect.width, rect.height) * adjustValues[1].rawValue / 100000;
        let dy = rect.height - Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right - dx, rect.y + dy);
        ctx.lineTo(rect.right, rect.y + dy);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.closePath();
    }
    function createDiagonalStripe(ctx, adjustValues, rect) {
        let line = getLineEquation({ x: rect.x, y: rect.bottom }, { x: rect.right, y: rect.y })
        let y = rect.y + rect.height * adjustValues[0].rawValue / 100000;
        line = getParallelLine(line, rect.x, y);
        let x = getLineX(line, rect.y);
        ctx.beginPath();
        ctx.moveTo(x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, y);
        ctx.lineTo(x, rect.y);
        ctx.closePath();
    }
    function createCross(ctx, adjustValues, rect) {
        let d = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + d, rect.y);
        ctx.lineTo(rect.right - d, rect.y);
        ctx.lineTo(rect.right - d, rect.y + d);
        ctx.lineTo(rect.right, rect.y + d);
        ctx.lineTo(rect.right, rect.bottom - d);
        ctx.lineTo(rect.right - d, rect.bottom - d);
        ctx.lineTo(rect.right - d, rect.bottom);
        ctx.lineTo(rect.x + d, rect.bottom);
        ctx.lineTo(rect.x + d, rect.bottom - d);
        ctx.lineTo(rect.x, rect.bottom - d);
        ctx.lineTo(rect.x, rect.y + d);
        ctx.lineTo(rect.x + d, rect.y + d);
        ctx.closePath();
    }
    function createProcessFlow(ctx, rect) {
        createRectange(ctx, rect);
    }
    function createDecisionFlow(ctx, rect) {
        createDiamond(ctx, rect);
    }
    function createDataFlow(ctx, rect) {
        createParallelogram(ctx, [{ rawValue: 20000 }], rect);
    }
    function createAltProcessFlow(ctx, rect) {
        createRoundRect(ctx, [{ rawValue: 20000 }], rect);
    }
    function createPredefineProcessFlow(ctx, rect) {
        let dx = rect.width * 0.12;
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.moveTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.moveTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right - dx, rect.bottom);
    }
    function createInternalStorageFlow(ctx, rect) {
        let dx = rect.width * 0.12;
        let dy = rect.height * 0.12;
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.moveTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.moveTo(rect.x, rect.y + dy);
        ctx.lineTo(rect.right, rect.y + dy);
    }
    function createDocumentFlow(ctx, rect) {
        let dy = rect.height * 0.22;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right, rect.bottom - dy);
        ctx.bezierCurveTo(rect.centerX, rect.bottom - dy, rect.centerX, rect.bottom, rect.x, rect.bottom - dy / 2);
        ctx.closePath();
        return rect.bottom - dy;
    }
    function createMultiDocumentFlow(ctx, rect) {
        let dy = rect.height * 0.1;
        let dx = rect.width * 0.1;
        let bottom = createDocumentFlow(ctx, createRect(rect.x, rect.y + 2 * dy, rect.width - 2 * dx, rect.height - 2 * dy));
        ctx.moveTo(rect.x + dx, rect.y + 2 * dy);
        ctx.lineTo(rect.x + dx, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y + dy);
        ctx.lineTo(rect.right - dx, bottom - dy);
        ctx.lineTo(rect.right - 2 * dx, bottom - dy);
        ctx.lineTo(rect.right - 2 * dx, rect.y + 2 * dy);
        ctx.lineTo(rect.x + dx, rect.y + 2 * dy);

        ctx.moveTo(rect.x + 2 * dx, rect.y + dy);
        ctx.lineTo(rect.x + 2 * dx, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right, bottom - 2 * dy);
        ctx.lineTo(rect.right - dx, bottom - 2 * dy);
        ctx.lineTo(rect.right - dx, rect.y + dy);
        ctx.lineTo(rect.x + 2 * dx, rect.y + dy);
    }
    function createTerminatorFlow(ctx, rect) {
        let dx = rect.width * 0.15;
        ctx.beginPath();
        ctx.moveTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.ellipse(rect.right - dx, rect.centerY, dx, rect.height / 2, 0, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.ellipse(rect.x + dx, rect.centerY, dx, rect.height / 2, 0, Math.PI / 2, 3 * Math.PI / 2);
    }
    function createPreparationFlow(ctx, rect) {
        createHexagon(ctx, [{ rawValue: 29000 }], rect);
    }
    function createManualInputFlow(ctx, rect) {
        let dy = rect.height * 0.2;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y + dy);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.closePath();
    }
    function createManualOperationFlow(ctx, rect) {
        let dx = rect.width * 0.2;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.closePath();
    }
    function createConnectorFlow(ctx, rect) {
        createEllipse(ctx, rect);
    }
    function createOffpageConnectorFlow(ctx, rect) {
        let dy = rect.height * 0.2;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right, rect.bottom - dy);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom - dy);
        ctx.closePath();
    }
    function createCardFlow(ctx, rect) {
        let dx = rect.width * 0.2;
        let dy = rect.height * 0.2;
        ctx.beginPath();
        ctx.moveTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y + dy);
        ctx.closePath();
    }
    function createPunchedTapeFlow(ctx, rect) {
        let dy = rect.height * 0.2;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y + dy / 2);
        ctx.ellipse(rect.x + rect.width / 4, rect.y + dy / 2, rect.width / 4, dy / 2, 0, Math.PI, 0, true);
        ctx.ellipse(rect.x + 3 * rect.width / 4, rect.y + dy / 2, rect.width / 4, dy / 2, 0, Math.PI, 2 * Math.PI);
        ctx.lineTo(rect.right, rect.bottom - dy / 2);
        ctx.ellipse(rect.x + 3 * rect.width / 4, rect.bottom - dy / 2, rect.width / 4, dy / 2, 0, 2 * Math.PI, Math.PI, true);
        ctx.ellipse(rect.x + rect.width / 4, rect.bottom - dy / 2, rect.width / 4, dy / 2, 0, 0, Math.PI);
        ctx.lineTo(rect.x, rect.y + dy / 2);
    }
    function createSwimmingJunctionFlow(ctx, rect) {
        let line1 = getLineEquation({ x: 0, y: 0 }, { x: rect.right, y: rect.bottom });
        let line2 = getLineEquation({ x: rect.right, y: rect.y }, { x: rect.x, y: rect.bottom });
        let pts1 = getLineEllipseIntersect(line1, rect.centerX, rect.centerY, rect.width / 2, rect.height / 2);
        let pts2 = getLineEllipseIntersect(line2, rect.centerX, rect.centerY, rect.width / 2, rect.height / 2);
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, 0, 2 * Math.PI);
        ctx.moveTo(pts1[0].x, pts1[0].y);
        ctx.lineTo(pts1[1].x, pts1[1].y);
        ctx.moveTo(pts2[0].x, pts2[0].y);
        ctx.lineTo(pts2[1].x, pts2[1].y);
    }
    function createOrFlow(ctx, rect) {
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, 0, 2 * Math.PI);
        ctx.moveTo(rect.centerX, rect.y);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.moveTo(rect.x, rect.centerY);
        ctx.lineTo(rect.right, rect.centerY);
    }
    function createCollateFlow(ctx, rect) {
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.centerX, rect.centerY);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.centerX, rect.centerY);
        ctx.lineTo(rect.x, rect.y);
    }
    function createSortFlow(ctx, rect) {
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.centerY);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.x, rect.centerY);
    }
    function createMergeFlow(ctx, rect) {
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(rect.x, rect.y);
        ctx.closePath();
    }
    function createStoredDataFlow(ctx, rect) {
        let dx = rect.width * 0.1699;
        ctx.beginPath();
        ctx.moveTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.ellipse(rect.right, rect.centerY, dx, rect.height / 2, 0, 3 * Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.ellipse(rect.x + dx, rect.centerY, dx, rect.height / 2, 0, Math.PI / 2, 3 * Math.PI / 2);
        ctx.closePath();
    }
    function createSequentialAccessStorageFlow(ctx, rect) {
        let dy = rect.height * 0.1699;
        let angle = Math.asin(1 - 2 * dy / rect.height);
        let x = rect.centerX + rect.width * Math.cos(angle) / 2;
        ctx.beginPath();
        ctx.moveTo(x, rect.bottom - dy);
        ctx.lineTo(rect.right, rect.bottom - dy);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, Math.PI / 2, 2 * Math.PI + angle);
        ctx.closePath();
    }
    function createMagneticDiskFlow(ctx, rect) {
        let radius = rect.height * 0.1679;
        ctx.beginPath();
        ctx.moveTo(rect.right, rect.y + radius);
        ctx.lineTo(rect.right, rect.bottom - radius);
        ctx.ellipse(rect.centerX, rect.bottom - radius, rect.width / 2, radius, 0, 0, Math.PI, false);
        ctx.lineTo(rect.x, rect.y + radius);
        ctx.ellipse(rect.centerX, rect.y + radius, rect.width / 2, radius, 0, Math.PI, 2 * Math.PI, false);
        ctx.closePath();
        ctx.ellipse(rect.centerX, rect.y + radius, rect.width / 2, radius, 0, 0, 2 * Math.PI, false);
    }
    function createDirectAccessStorageFlow(ctx, rect) {
        let radius = rect.width * 0.1679;
        ctx.beginPath();
        ctx.ellipse(rect.right - radius, rect.centerY, radius, rect.height / 2, 0, -Math.PI / 2, Math.PI / 2, false);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.ellipse(rect.x - radius, rect.centerY, radius, rect.height / 2, 0, Math.PI / 2, 3 * Math.PI / 2, false);
        ctx.lineTo(rect.right - radius, rect.y);
        ctx.moveTo(rect.right - radius, rect.bottom);
        ctx.ellipse(rect.right - radius, rect.centerY, radius, rect.height / 2, 0, Math.PI / 2, 3 * Math.PI / 2, false);
    }
    function createDisplayFlow(ctx, rect) {
        let radius = rect.width * 0.1679;
        ctx.beginPath();
        ctx.ellipse(rect.right - radius, rect.centerY, radius, rect.height / 2, 0, -Math.PI / 2, Math.PI / 2, false);
        ctx.lineTo(rect.x + radius, rect.bottom);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.x + radius, rect.y);
        ctx.lineTo(rect.right - radius, rect.y);
    }
    function createDelayFlow(ctx, rect) {
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, - Math.PI / 2, Math.PI / 2);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.closePath();
    }
    function createExplosion8(ctx, rect, needFill, needStroke) {
        let paths = [{ "data": [{ "segmentData": [0.49999998500260945, 0.268518514598517], "pathCommand": 1 }, { "segmentData": [0.6723148439403028, 0], "pathCommand": 2 }, { "segmentData": [0.6553240901615528, 0.24652778272232517], "pathCommand": 2 }, { "segmentData": [0.8509258474118089, 0.20634259728768536], "pathCommand": 2 }, { "segmentData": [0.7732407138481975, 0.3386574209937764], "pathCommand": 2 }, { "segmentData": [0.9767129217187501, 0.376712977778787], "pathCommand": 2 }, { "segmentData": [0.815138923978617, 0.4849537219228018], "pathCommand": 2 }, { "segmentData": [1, 0.615277759870498], "pathCommand": 2 }, { "segmentData": [0.7794907564032934, 0.5991666732415784], "pathCommand": 2 }, { "segmentData": [0.8400462903459427, 0.8377314745769332], "pathCommand": 2 }, { "segmentData": [0.6490741075960194, 0.6693055603931938], "pathCommand": 2 }, { "segmentData": [0.6132870341889215, 0.913749987732177], "pathCommand": 2 }, { "segmentData": [0.48759258376635056, 0.6914352121351959], "pathCommand": 2 }, { "segmentData": [0.3928240725396188, 1], "pathCommand": 2 }, { "segmentData": [0.35717593495907646, 0.723472223050768], "pathCommand": 2 }, { "segmentData": [0.22046296164930265, 0.8156018613222192], "pathCommand": 2 }, { "segmentData": [0.26236111179015964, 0.6452314923773039], "pathCommand": 2 }, { "segmentData": [0.006250000562402149, 0.6753240485317004], "pathCommand": 2 }, { "segmentData": [0.17231481394552162, 0.5451388727188825], "pathCommand": 2 }, { "segmentData": [0, 0.39884257178985705], "pathCommand": 2 }, { "segmentData": [0.2142129790837692, 0.3526388905192531], "pathCommand": 2 }, { "segmentData": [0.017129630515586594, 0.10625000072163665], "pathCommand": 2 }, { "segmentData": [0.3385185211625029, 0.29259260185805075], "pathCommand": 2 }, { "segmentData": [0.38666668386367453, 0.10625000072163665], "pathCommand": 2 }, { "segmentData": [], "pathCommand": 0 }] }];
        for (var i = 0; i < paths[0].data.length; i++) {
            for (var j = 0; j < paths[0].data[i].segmentData.length; j++) {
                if (j % 2 == 0) {
                    paths[0].data[i].segmentData[j] *= rect.width;
                }
                else {
                    paths[0].data[i].segmentData[j] *= rect.height;
                }
            }
        }
        ctx.beginPath();
        createPaths(ctx, paths, rect, needFill, needStroke)
        ctx.closePath();
    }
    function createExplosion14(ctx, rect, needFill, needStroke) {
        let paths = [{ "data": [{ "segmentData": [0.5306481469688559, 0.2010185236974329], "pathCommand": 1 }, { "segmentData": [0.6847222122989093, 0], "pathCommand": 2 }, { "segmentData": [0.6724536839289859, 0.26745370693935455], "pathCommand": 2 }, { "segmentData": [0.8336573752357391, 0.14685185239502913], "pathCommand": 2 }, { "segmentData": [0.7583333203898817, 0.30240740401723204], "pathCommand": 2 }, { "segmentData": [1, 0.3076388923305725], "pathCommand": 2 }, { "segmentData": [0.7863426185514042, 0.4352778109584173], "pathCommand": 2 }, { "segmentData": [0.8458333009747041, 0.5226851699668563], "pathCommand": 2 }, { "segmentData": [0.7583333203898817, 0.5699074042700903], "pathCommand": 2 }, { "segmentData": [0.8739351707029009, 0.7237037138929602], "pathCommand": 2 }, { "segmentData": [0.6777777915841263, 0.6643518324192166], "pathCommand": 2 }, { "segmentData": [0.6917592667089348, 0.8041666915310748], "pathCommand": 2 }, { "segmentData": [0.5638888880259921, 0.7377314880604822], "pathCommand": 2 }, { "segmentData": [0.537592598747923, 0.8723148082873224], "pathCommand": 2 }, { "segmentData": [0.45703700781359946, 0.8041666915310748], "pathCommand": 2 }, { "segmentData": [0.40277776828591316, 0.9125926207628899], "pathCommand": 2 }, { "segmentData": [0.3484722119106057, 0.8391203683802813], "pathCommand": 2 }, { "segmentData": [0.22763888763768855, 1], "pathCommand": 2 }, { "segmentData": [0.22245369946112786, 0.8444444534349649], "pathCommand": 2 }, { "segmentData": [0.05949073833901137, 0.8252314640389354], "pathCommand": 2 }, { "segmentData": [0.15416666796101186, 0.7115740464937796], "pathCommand": 2 }, { "segmentData": [0, 0.5961573920064587], "pathCommand": 2 }, { "segmentData": [0.18217592573896496, 0.536666640706539], "pathCommand": 2 }, { "segmentData": [0.05425925816625667, 0.38287038165534654], "pathCommand": 2 }, { "segmentData": [0.24870370295585983, 0.3618981553171517], "pathCommand": 2 }, { "segmentData": [0.20842593855298217, 0.1678240686188885], "pathCommand": 2 }, { "segmentData": [0.3958333320389882, 0.2954629518465591], "pathCommand": 2 }, { "segmentData": [0.45009258709881644, 0.08736111626661268], "pathCommand": 2 }, { "segmentData": [], "pathCommand": 0 }] }];
        for (var i = 0; i < paths[0].data.length; i++) {
            for (var j = 0; j < paths[0].data[i].segmentData.length; j++) {
                if (j % 2 == 0) {
                    paths[0].data[i].segmentData[j] *= rect.width;
                }
                else {
                    paths[0].data[i].segmentData[j] *= rect.height;
                }
            }
        }
        ctx.beginPath();
        createPaths(ctx, paths, rect, needFill, needStroke)
        ctx.closePath();
    }
    function createStar4(ctx, adjusts, rect) {
        let ry = 1.41421356 * rect.height * adjusts[0].rawValue / 100000;
        let rx = rect.height * ry / rect.height;
        let line1 = getLineEquation({ x: rect.x, y: rect.y }, { x: rect.right, y: rect.bottom });
        let line2 = getLineEquation({ x: rect.right, y: rect.y }, { x: rect.x, y: rect.bottom });
        let pt1s = getLineEllipseIntersect(line1, rect.centerY, rect.centerY, rx, ry);
        ctx.beginPath();
        ctx.moveTo(rect.centerX, rect.y);
        ctx.lineTo(pt1s[0].x, -pt1s[0].y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(pt1s[0].x, pt1s[0].y);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(pt1s[1].x, -pt1s[1].y);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(pt1s[1].x, pt1s[1].y);
        ctx.closePath();
    }
    function createStar5(ctx, adjusts, rect) {
        let r = 1.9483 * adjusts[0].rawValue / 100000;
        let rx = 0.185;
        let ry = 0.382;
        let r2 = 0.1227;
        let dx = rx * rect.width;
        let dy = ry * rect.height;
        let dx2 = r2 * rect.width;
        let line = getLineEquation({ x: rect.x + dx2, y: rect.y }, { x: rect.right - dx, y: rect.bottom })
        let center = getLineIntersect(line, [-1, 0, rect.centerX]);
        let v1 = { x: center.x - rect.x - dx, y: center.y - rect.bottom };
        v1.x = v1.x * r;
        v1.y = v1.y * r;
        let v2 = { x: center.x - rect.x, y: center.y - rect.y - dy };
        v2.x = v2.x * r;
        v2.y = v2.y * r;
        let v3 = { x: center.x - rect.centerX, y: center.y - rect.y };
        v3.x = v3.x * r;
        v3.y = v3.y * r;
        let v4 = { x: center.x - rect.right, y: center.y - rect.y - dy };
        v4.x = v4.x * r;
        v4.y = v4.y * r;
        let v5 = { x: center.x - rect.right + dx, y: center.y - rect.bottom };
        v5.x = v5.x * r;
        v5.y = v5.y * r;
        let points = [];
        points.push({ x: rect.centerX, y: rect.y });
        points.push({ x: center.x + v1.x, y: center.y + v1.y });
        points.push({ x: rect.right, y: rect.y + dy });
        points.push({ x: center.x + v2.x, y: center.y + v2.y });
        points.push({ x: rect.right - dx, y: rect.bottom });
        points.push({ x: center.x + v3.x, y: center.y + v3.y });
        points.push({ x: rect.x + dx, y: rect.bottom });
        points.push({ x: center.x + v4.x, y: center.y + v4.y });
        points.push({ x: rect.x, y: rect.y + dy });
        points.push({ x: center.x + v5.x, y: center.y + v5.y });
        createPolygon(ctx, points);
    }
    function createStar6(ctx, adjusts, rect) {
        let ry = rect.height * adjusts[0].rawValue / 100000;
        let rx = 1.1368 * rect.width * adjusts[0].rawValue / 100000;
        let p1 = { x: rect.centerX, y: rect.y };
        let p3 = { x: rect.right, y: rect.y + rect.height / 4 };
        let p5 = { x: rect.right, y: rect.bottom - rect.height / 4 };
        let p7 = { x: rect.centerX, y: rect.bottom };
        let p9 = { x: rect.x, y: rect.bottom - rect.height / 4 };
        let p11 = { x: rect.x, y: rect.y + rect.height / 4 };
        let line1 = getLineEquation({ x: (p3.x + p1.x) / 2, y: (p3.y + p1.y) / 2 }, { x: (p7.x + p9.x) / 2, y: (p7.y + p9.y) / 2 });
        let pts1 = getLineEllipseIntersect(line1, rect.centerX, rect.centerY, rx, ry);
        let p2 = pts1[0];
        let p6 = { x: p2.x, y: 2 * rect.centerY - p2.y };
        let p8 = { x: 2 * rect.centerX - p2.x, y: 2 * rect.centerY - p2.y };
        let p12 = { x: 2 * rect.centerX - p2.x, y: p2.y };
        let p4 = { x: rect.centerX + rx, y: rect.centerY };
        let p10 = { x: rect.centerX - rx, y: rect.centerY };
        let points = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12];
        createPolygon(ctx, points);
    }
    function createStar7(ctx, adjusts, rect) {
        let ry = rect.height * adjusts[0].rawValue / 100000;
        let rx = 1.01124 * rect.width * adjusts[0].rawValue / 100000;
        const spikes = 7;
        const delta = 2 * Math.PI / spikes;
        var angle = -Math.PI / 2;
        const points = [];
        for (let i = 0; i < spikes; i++) {
            const x1 = rect.centerX + Math.cos(angle) * rect.width / 2;
            const y1 = rect.centerY + Math.sin(angle) * rect.height / 2;
            points.push({ x: x1, y: y1 });
            angle += delta / 2;
            const x2 = rect.centerX + Math.cos(angle) * rx;
            const y2 = rect.centerY + Math.sin(angle) * ry;
            points.push({ x: x2, y: y2 });
            angle += delta / 2;
        }
        createPolygon(ctx, points);
    }
    function createEllipse(ctx, rect) {
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, 0, 2 * Math.PI);
        ctx.closePath();
    }
    function createWheel(ctx, adjustValues, rect) {
        let radius = Math.min(rect.height, rect.width) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.moveTo(rect.right - radius, rect.centerY);
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2 - radius, rect.height / 2 - radius, 0, 2 * Math.PI, 0, true);
        ctx.moveTo(rect.right, rect.centerY);
        ctx.closePath();
    }
    function createBlockArc(ctx, adjustValues, rect) {
        let angle1 = adjustValues[0].angleValue * Math.PI / 180;
        let angle2 = adjustValues[1].angleValue * Math.PI / 180;
        let radius = Math.min(rect.height, rect.width) * adjustValues[2].rawValue / 100000;
        let sin1 = Math.sin(angle1);
        let cos1 = Math.cos(angle1);
        let sin2 = Math.sin(angle2);
        let cos2 = Math.cos(angle2);
        let p11 = { x: rect.centerX + cos1 * rect.width / 2, y: rect.centerY + sin1 * rect.height / 2 };
        let p12 = { x: rect.centerX + cos1 * (rect.width / 2 - radius), y: rect.centerY + sin1 * (rect.height / 2 - radius) };
        let p21 = { x: rect.centerX + cos2 * rect.width / 2, y: rect.centerY + sin2 * rect.height / 2 };
        let p22 = { x: rect.centerX + cos2 * (rect.width / 2 - radius), y: rect.centerY + sin2 * (rect.height / 2 - radius) };

        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, angle1, angle2);
        ctx.lineTo(p22.x, p22.y);
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2 - radius, rect.height / 2 - radius, 0, angle2, angle1, true);
        ctx.lineTo(p11.x, p11.y);

        ctx.closePath();
        //ctx.moveTo(rect.right - radius, rect.centerY);
        //ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2 - radius, rect.height / 2 - radius, 0, 2 * Math.PI, 0, true);
        //ctx.moveTo(rect.right, rect.centerY);
        //ctx.closePath();
    }
    function createArc(ctx, adjustValues, rect) {
        let angle1 = adjustValues[0].angleValue * Math.PI / 180;
        let angle2 = adjustValues[1].angleValue * Math.PI / 180;
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, angle1, angle2);
    }
    function createDoubleBracket(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        createLeftBracketPath(ctx, radius, createRect(rect.x, rect.y, radius, rect.height));
        createRightBracketPath(ctx, radius, createRect(rect.right - radius, rect.y, radius, rect.height));
        ctx.stroke();
    }
    function createLeftBracketPath(ctx, radius, rect) {
        ctx.moveTo(rect.right, rect.y);
        ctx.quadraticCurveTo(rect.x, rect.y, rect.x, rect.y + radius);
        ctx.lineTo(rect.x, rect.bottom - radius);
        ctx.quadraticCurveTo(rect.x, rect.bottom, rect.right, rect.bottom);
    }
    function createLeftBracket(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        createLeftBracketPath(ctx, radius, rect);
        ctx.stroke();
    }
    function createRightBracketPath(ctx, radius, rect) {
        ctx.moveTo(rect.x, rect.y);
        ctx.quadraticCurveTo(rect.right, rect.y, rect.right, rect.y + radius);
        ctx.lineTo(rect.right, rect.bottom - radius);
        ctx.quadraticCurveTo(rect.right, rect.bottom, rect.x, rect.bottom);
    }
    function createRightBracket(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        createRightBracketPath(ctx, radius, rect);
        ctx.stroke();
    }
    function createDoubleBrace(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        createLeftBracePath(ctx, rect.height / 2, radius, createRect(rect.x, rect.y, 2 * radius, rect.height));
        createRightBracePath(ctx, rect.height / 2, radius, createRect(rect.right - 2 * radius, rect.y, 2 * radius, rect.height));
        ctx.stroke();
    }
    function createLeftBrace(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        let dy = rect.height * adjustValues[1].rawValue / 100000;
        ctx.beginPath();
        createLeftBracePath(ctx, dy, radius, rect);
        ctx.stroke();
    }
    function createRightBrace(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        let dy = rect.height * adjustValues[1].rawValue / 100000;
        ctx.beginPath();
        createRightBracePath(ctx, dy, radius, rect);
        ctx.stroke();
    }
    function createLeftBracePath(ctx, dy, radius, rect) {
        ctx.moveTo(rect.right, rect.y);
        ctx.quadraticCurveTo(rect.centerX, rect.y, rect.centerX, rect.y + radius);
        ctx.lineTo(rect.centerX, rect.y + dy - radius);
        ctx.quadraticCurveTo(rect.centerX, rect.y + dy, rect.x, rect.y + dy);
        ctx.quadraticCurveTo(rect.centerX, rect.y + dy, rect.centerX, rect.y + dy + radius);
        ctx.lineTo(rect.centerX, rect.bottom - radius);
        ctx.quadraticCurveTo(rect.centerX, rect.bottom, rect.right, rect.bottom);
    }
    function createRightBracePath(ctx, dy, radius, rect) {
        ctx.moveTo(rect.x, rect.y);
        ctx.quadraticCurveTo(rect.centerX, rect.y, rect.centerX, rect.y + radius);
        ctx.lineTo(rect.centerX, rect.y + dy - radius);
        ctx.quadraticCurveTo(rect.centerX, rect.y + dy, rect.right, rect.y + dy);
        ctx.quadraticCurveTo(rect.centerX, rect.y + dy, rect.centerX, rect.y + dy + radius);
        ctx.lineTo(rect.centerX, rect.bottom - radius);
        ctx.quadraticCurveTo(rect.centerX, rect.bottom, rect.x, rect.bottom);
    }
    function createForbiden(ctx, adjustValues, rect) {
        let radius = Math.min(rect.height, rect.width) * adjustValues[0].rawValue / 100000;
        let line = getLineEquation({ x: rect.x, y: rect.y }, { x: rect.right, y: rect.bottom });
        let v = { x: rect.right - rect.centerX, y: rect.bottom - rect.centerY };
        v = vectorRotate(v, 90);//right angle
        let d = vectorLength(v);
        v.x = radius * v.x / (2 * d);
        v.y = radius * v.y / (2 * d);
        let v1 = { x: rect.centerX + v.x, y: rect.centerY + v.y };
        let v2 = { x: rect.centerX - v.x, y: rect.centerY - v.y };
        let line1 = getParallelLine(line, v1.x, v1.y);
        let line2 = getParallelLine(line, v2.x, v2.y);
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, 0, 2 * Math.PI);
        ctx.closePath();

        let points = getLineEllipseIntersect(line1, rect.centerX, rect.centerY, rect.width / 2 - radius, rect.height / 2 - radius);
        var a1 = Math.atan2(points[0].y, points[0].x);
        var a2 = Math.atan2(points[1].y, points[1].x);
        ctx.moveTo(points[0].x, points[0].y);
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2 - radius, rect.height / 2 - radius, 0, a2, a1, true);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.closePath();


        points = getLineEllipseIntersect(line2, rect.centerX, rect.centerY, rect.width / 2 - radius, rect.height / 2 - radius);
        a1 = Math.atan2(points[0].y, points[0].x);
        a2 = Math.atan2(points[1].y, points[1].x);
        ctx.moveTo(points[0].x, points[0].y);
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2 - radius, rect.height / 2 - radius, 0, a1, a2, true);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.closePath();
    }
    function createDiamond(ctx, rect) {
        ctx.beginPath();
        ctx.moveTo(rect.centerX, rect.y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.closePath();
    }
    function createParallelogram(ctx, adjustValues, rect) {
        let radius = rect.width * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + radius, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right - radius, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x + radius, rect.y);
        ctx.closePath();
    }
    function createPentagon(ctx, rect) {
        var dy = 0.6235 * rect.height;
        var dx = 0.1893 * rect.width;
        ctx.beginPath();
        ctx.moveTo(rect.centerX, rect.y);
        ctx.lineTo(rect.right, rect.bottom - dy);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom - dy);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.closePath();
    }
    function createHexagon(ctx, adjustValues, rect) {
        let radius = Math.min(rect.height * adjustValues[0].rawValue / 100000, rect.width / 2);
        ctx.beginPath();
        ctx.moveTo(rect.x + radius, rect.y);
        ctx.lineTo(rect.right - radius, rect.y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - radius, rect.bottom);
        ctx.lineTo(rect.x + radius, rect.bottom);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.x + radius, rect.y);
        ctx.closePath();
    }
    function createHeptagon(ctx, rect) {
        let dx = rect.width * 0.27149;
        let dy = rect.height * 0.6468;
        let line1 = getLineEquation(
            { x: rect.x, y: rect.y },
            { x: rect.centerX, y: rect.bottom });
        let line2 = getLineEquation(
            { x: rect.centerX, y: rect.y },
            { x: rect.x, y: rect.y + rect.height / 4 });
        let p1 = getLineIntersect(line1, line2);
        let p2 = { x: rect.centerX + rect.centerX - p1.x, y: p1.y };
        ctx.beginPath();
        ctx.moveTo(rect.centerX, rect.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(rect.right, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.lineTo(rect.x, rect.y + dy);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.closePath();
    }
    function createOctagon(ctx, adjustValues, rect) {
        let radius = Math.min(rect.height * adjustValues[0].rawValue / 100000, rect.width / 2);
        ctx.beginPath();
        ctx.moveTo(rect.x + radius, rect.y);
        ctx.lineTo(rect.right - radius, rect.y);
        ctx.lineTo(rect.right, rect.y + radius);
        ctx.lineTo(rect.right, rect.bottom - radius);
        ctx.lineTo(rect.right - radius, rect.bottom);
        ctx.lineTo(rect.x + radius, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom - radius);
        ctx.lineTo(rect.x, rect.y + radius);
        ctx.lineTo(rect.x + radius, rect.y);
        ctx.closePath();
    }
    function createDecagon(ctx, rect) {
        let dx = rect.width * 0.35049;
        let dy = rect.height * 0.18849;
        let dx2 = rect.width * 0.097;
        ctx.beginPath();
        ctx.moveTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right - dx2, rect.y + dy);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - dx2, rect.bottom - dy);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.lineTo(rect.x + dx2, rect.bottom - dy);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.x + dx2, rect.y + dy);
        ctx.lineTo(rect.x + dx, rect.y);
        ctx.closePath();
    }
    function createDodecagon(ctx, rect) {
        let dx = rect.width * 0.35449;
        let dy = rect.height * 0.35449;
        let dx2 = rect.width * 0.117;
        let dy2 = rect.height * 0.117;
        ctx.beginPath();
        ctx.moveTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right - dx2, rect.y + dy2);
        ctx.lineTo(rect.right, rect.y + dy);
        ctx.lineTo(rect.right, rect.bottom - dy);
        ctx.lineTo(rect.right - dx2, rect.bottom - dy2);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.lineTo(rect.x + dx2, rect.bottom - dy2);
        ctx.lineTo(rect.x, rect.bottom - dy);
        ctx.lineTo(rect.x, rect.y + dy);
        ctx.lineTo(rect.x + dx2, rect.y + dy2);
        ctx.lineTo(rect.x + dx, rect.y);
        ctx.closePath();
    }
    function createTrapezoid(ctx, adjustValues, rect) {
        let radius = rect.width * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + radius, rect.y);
        ctx.lineTo(rect.right - radius, rect.y);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x + radius, rect.y);
        ctx.closePath();
    }
    function createRoundRect(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + radius, rect.y);
        ctx.lineTo(rect.right - radius, rect.y);
        ctx.quadraticCurveTo(rect.right, rect.y, rect.right, rect.y + radius);
        ctx.lineTo(rect.right, rect.bottom - radius);
        ctx.quadraticCurveTo(rect.right, rect.bottom, rect.right - radius, rect.bottom);
        ctx.lineTo(rect.x + radius, rect.bottom);
        ctx.quadraticCurveTo(rect.x, rect.bottom, rect.x, rect.bottom - radius);
        ctx.lineTo(rect.x, rect.y + radius);
        ctx.quadraticCurveTo(rect.x, rect.y, rect.x + radius, rect.y);
        ctx.closePath();
    }
    function createRoundTopBottomRect(ctx, adjustValues, rect) {
        let radius1 = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        let radius2 = Math.min(rect.width, rect.height) * adjustValues[1].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + radius1, rect.y);
        ctx.lineTo(rect.right - radius1, rect.y);
        ctx.quadraticCurveTo(rect.right, rect.y, rect.right, rect.y + radius1);
        ctx.lineTo(rect.right, rect.bottom - radius2);
        ctx.quadraticCurveTo(rect.right, rect.bottom, rect.right - radius2, rect.bottom);
        ctx.lineTo(rect.x + radius2, rect.bottom);
        ctx.quadraticCurveTo(rect.x, rect.bottom, rect.x, rect.bottom - radius2);
        ctx.lineTo(rect.x, rect.y + radius1);
        ctx.quadraticCurveTo(rect.x, rect.y, rect.x + radius1, rect.y);
        ctx.closePath();
    }
    function createRoundDiagonalRect(ctx, adjustValues, rect) {
        let radius1 = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        let radius2 = Math.min(rect.width, rect.height) * adjustValues[1].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + radius1, rect.y);
        ctx.lineTo(rect.right - radius2, rect.y);
        ctx.quadraticCurveTo(rect.right, rect.y, rect.right, rect.y + radius2);
        ctx.lineTo(rect.right, rect.bottom - radius1);
        ctx.quadraticCurveTo(rect.right, rect.bottom, rect.right - radius1, rect.bottom);
        ctx.lineTo(rect.x + radius2, rect.bottom);
        ctx.quadraticCurveTo(rect.x, rect.bottom, rect.x, rect.bottom - radius2);
        ctx.lineTo(rect.x, rect.y + radius1);
        ctx.quadraticCurveTo(rect.x, rect.y, rect.x + radius1, rect.y);
        ctx.closePath();
    }
    function createRoundRightRect(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right - radius, rect.y);
        ctx.quadraticCurveTo(rect.right, rect.y, rect.right, rect.y + radius);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y);
        ctx.closePath();
    }
    function createRoundLeftCutRightRect(ctx, adjustValues, rect) {
        let radius1 = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        let radius2 = Math.min(rect.width, rect.height) * adjustValues[1].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + radius1, rect.y);
        ctx.lineTo(rect.right - radius2, rect.y);
        ctx.lineTo(rect.right, rect.y + radius2);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y + radius1);
        ctx.quadraticCurveTo(rect.x, rect.y, rect.x + radius1, rect.y);
        ctx.closePath();
    }
    function createCutRightRect(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right - radius, rect.y);
        ctx.lineTo(rect.right, rect.y + radius);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y);
        ctx.closePath();
    }
    function createFoldedConnerRect(ctx, adjustValues, rect) {
        let d = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right, rect.bottom - d);
        ctx.lineTo(rect.right - d, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rect.right - d, rect.bottom);
        ctx.lineTo(rect.right - d + d / 5, rect.bottom - d + d / 5);
        ctx.lineTo(rect.right, rect.bottom - d);
        ctx.closePath();
        ctx.stroke();
    }
    function createFace(ctx, adjustValues, rect) {
        const eye = 0.06;
        const eye_distance = 0.35;
        let d = rect.height * adjustValues[0].rawValue / 100000;
        var p1 = { x: rect.x + rect.width / 4, y: rect.bottom - rect.height / 4 };
        var p2 = { x: rect.x + 3 * rect.width / 4, y: rect.bottom - rect.height / 4 };
        var p3 = { x: (p1.x + p2.x) / 2, y: p1.y + d };
        var mouth = fitCircleToPoints(p1.x, p1.y, p3.x, p3.y, p2.x, p2.y);

        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, rect.width / 2, rect.height / 2, 0, Math.PI * 2, 0, true); // Outer circle
        ctx.stroke();
        const sign = Math.sign(d);
        const ang1 = Math.atan2(p1.y - mouth.y, p1.x - mouth.x) + sign * Math.PI / 60;
        const ang2 = Math.atan2(p2.y - mouth.y, p2.x - mouth.x) - sign * Math.PI / 60;
        ctx.beginPath();
        ctx.ellipse(mouth.x, mouth.y - sign * mouth.radius * 0.5, mouth.radius, mouth.radius, 0, ang1, ang2, mouth.CCW);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(rect.x + rect.width * eye_distance, rect.y + rect.height * eye_distance, rect.width * eye, rect.height * eye, 0, 0, Math.PI * 2, true); // Left eye
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(rect.right - rect.width * eye_distance, rect.y + rect.height * eye_distance, rect.width * eye, rect.height * eye, 0, 0, Math.PI * 2, true); // Left eye
        ctx.stroke();
    }
    function createLightBolt(ctx, rect, needFill, needStroke) {
        let path = [{ "segmentData": [0.3922222202587337, 0], "pathCommand": 1 }, { "segmentData": [0.5953703931518717, 0.2814814522424063], "pathCommand": 2 }, { "segmentData": [0.5115740714938487, 0.31467590388734984], "pathCommand": 2 }, { "segmentData": [0.7674536917654419, 0.5558796209671769], "pathCommand": 2 }, { "segmentData": [0.683657397294183, 0.5961573317136212], "pathCommand": 2 }, { "segmentData": [1, 0.9999999186128836], "pathCommand": 2 }, { "segmentData": [0.46351853002254734, 0.6905091716362318], "pathCommand": 2 }, { "segmentData": [0.5658333062598475, 0.6475462557572229], "pathCommand": 2 }, { "segmentData": [0.23249999286347445, 0.44930551152738635], "pathCommand": 2 }, { "segmentData": [0.3519444313419346, 0.3880555209886386], "pathCommand": 2 }, { "segmentData": [0, 0.1800925770310745], "pathCommand": 2 }, { "segmentData": [], "pathCommand": 0 }];
        for (var s of path) {
            if (s.segmentData.length > 0) {
                s.segmentData[0] = s.segmentData[0] * rect.width;
                s.segmentData[1] = s.segmentData[1] * rect.height;
            }
        }
        createPaths(ctx, [{ data: path }], rect, needFill, needStroke);
    }
    function createSun(ctx, adjustValues, rect) {
        let radiusX = rect.width / 2 - rect.width * adjustValues[0].rawValue / 100000;
        let radiusY = rect.height * radiusX / rect.width;
        let delta = Math.PI / 4;
        let alpha = 0;
        let points1 = [];
        let points2 = [];
        for (var i = 0; i < 8; i++) {
            var sin = Math.sin(alpha);
            var cos = Math.cos(alpha);
            var sin1 = Math.sin(alpha + delta / 2);
            var cos1 = Math.cos(alpha + delta / 2);
            points1.push({
                x: rect.centerX + rect.width * cos / 2,
                y: rect.centerX + rect.height * sin / 2,
            });
            points2.push({
                x: rect.centerX + radiusX * cos1,
                y: rect.centerX + radiusY * sin1,
            });
            alpha += delta;
        }
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.closePath();
        for (var i = 0; i < 8; i++) {
            let i1 = i == 0 ? 7 : i - 1;
            ctx.moveTo(points1[i].x, points1[i].y);
            let v1 = { x: points2[i1].x - points1[i].x, y: points2[i1].y - points1[i].y };
            let v2 = { x: points2[i].x - points1[i].x, y: points2[i].y - points1[i].y };
            let r = 0.74;
            ctx.lineTo(points1[i].x + r * v1.x, points1[i].y + r * v1.y);
            ctx.lineTo(points1[i].x + r * v2.x, points1[i].y + r * v2.y);
            ctx.closePath();
        }
    }
    function createMoon(ctx, adjustValues, rect) {
        let radius = rect.width - rect.width * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.ellipse(rect.right, rect.centerY, rect.width, rect.height / 2, 0, Math.PI / 2, 3 * Math.PI / 2);
        ctx.ellipse(rect.right, rect.centerY, radius, rect.height / 2, 0, 3 * Math.PI / 2, Math.PI / 2, true);
        ctx.closePath();
    }
    function createClouds(ctx, rect, needFill, needStroke) {
        let paths = [{ "data": [{ "segmentData": [0.09099315490709205, 0.32923020667206704], "pathCommand": 1 }, { "segmentData": [0.08472812791690931, 0.2664568911083642, 0.09933881327894427, 0.20315138692354845, 0.13082577311997945, 0.15655151770376502], "pathCommand": 5 }, { "segmentData": [0.1805760938984817, 0.08294963189884909, 0.26123541251015997, 0.06654481015801735, 0.32460235001654836, 0.11710127428964513], "pathCommand": 5 }, { "segmentData": [0.36327905776547215, 0.017769961790829007, 0.461207644964898, -0.002753418575990847, 0.5199740836244222, 0.07614706558738057], "pathCommand": 5 }, { "segmentData": [0.5347928595669272, 0.035678750980509516, 0.5632513071599036, 0.007704944764120617, 0.5961022511056792, 0.0013651403380911318], "pathCommand": 5 }, { "segmentData": [0.6322590439582669, -0.00562252693911849, 0.6683696930862979, 0.014553783994267508, 0.6905168513866815, 0.05414285336676951], "pathCommand": 5 }, { "segmentData": [0.7224662309754963, 0.0029153844508386885, 0.7753143812270524, -0.013905921359157782, 0.8206722395321419, 0.012702746967937962], "pathCommand": 5 }, { "segmentData": [0.855233923104566, 0.03297160986067564, 0.8800165588889972, 0.07540664991256711, 0.8866747053416578, 0.12575487978814728], "pathCommand": 5 }, { "segmentData": [0.9266228387111155, 0.14060944675675793, 0.958433448332394, 0.18179503805828184, 0.971379608939049, 0.23547511686348163], "pathCommand": 5 }, { "segmentData": [0.980788693825309, 0.2744394971523001, 0.9794479171003934, 0.3167588314998679, 0.967588268422179, 0.35445059308806603], "pathCommand": 5 }, { "segmentData": [0.9967402948177446, 0.40614080746808484, 1.0069354153526404, 0.4731483900269678, 0.9952837861081844, 0.5363613008389366], "pathCommand": 5 }, { "segmentData": [0.9797947065016881, 0.6203984295138351, 0.9285185259092439, 0.6833336898495092, 0.8655446062271734, 0.6955968379680076], "pathCommand": 5 }, { "segmentData": [0.8652440960679821, 0.7480505947590106, 0.8482984738725389, 0.7977972486026187, 0.8191002021142566, 0.8320414843662617], "pathCommand": 5 }, { "segmentData": [0.7747364327709478, 0.8840787294310873, 0.7106527937806119, 0.8907656044429263, 0.6609718579858779, 0.8485619397879471], "pathCommand": 5 }, { "segmentData": [0.6449047282851172, 0.9210532741041128, 0.6018818034254974, 0.9764687079990635, 0.5479701792283922, 0.9941228848597519], "pathCommand": 5 }, { "segmentData": [0.48444141683188224, 1.014923983188858, 0.4181385086219481, 0.9794766961941287, 0.3818198400601589, 0.9052731479290769], "pathCommand": 5 }, { "segmentData": [0.29609762318146887, 0.9757051151716504, 0.18476048950699495, 0.9361160465193831, 0.13501016872849272, 0.8174876297889936], "pathCommand": 5 }, { "segmentData": [0.08613834044467304, 0.8252851787294815, 0.04024875194268638, 0.7839838673189401, 0.026493433006037, 0.7197991726375924], "pathCommand": 5 }, { "segmentData": [0.01652949862946023, 0.6733612481897802, 0.025337524574836564, 0.6232444081158063, 0.04968096628618195, 0.5879358671334076], "pathCommand": 5 }, { "segmentData": [0.015142406750291607, 0.5602396739411092, -0.0040919177572469444, 0.5070917549476343, 0.0007166635390346265, 0.4526481337314503], "pathCommand": 5 }, { "segmentData": [0.006357499081953321, 0.38890302709602165, 0.04348529378831949, 0.33897128013723066, 0.09013778170582915, 0.33240011082971543], "pathCommand": 5 }, { "segmentData": [0.09041519967511022, 0.33133576239687773, 0.0907157335498723, 0.33029455510490474, 0.09099315490709205, 0.32923020667206704], "pathCommand": 5 }, { "segmentData": [], "pathCommand": 0 }] }, { "data": [{ "segmentData": [0.109325873724818, 0.6024202190622646], "pathCommand": 1 }, { "segmentData": [0.08888939745612559, 0.6045951838049755, 0.06845292796331051, 0.5981628397356077, 0.05076751886988665, 0.5839792578168693], "pathCommand": 5 }, { "segmentData": [0.1609950009948682, 0.8042296214813744], "pathCommand": 1 }, { "segmentData": [0.15278803805590185, 0.8086952206593849, 0.14416496849064586, 0.8116568977633327, 0.13538006387145238, 0.8130452221682767], "pathCommand": 5 }, { "segmentData": [0.381773608249197, 0.9012008689199499], "pathCommand": 1 }, { "segmentData": [0.3756010414929995, 0.8885675201663915, 0.37042257725033745, 0.8750780716407371, 0.36633065881550275, 0.8609407575990343], "pathCommand": 5 }, { "segmentData": [0.6672599737780323, 0.800805193583602], "pathCommand": 1 }, { "segmentData": [0.6663584094210714, 0.8157754878635772, 0.6642777746514632, 0.8305837725504585, 0.6610874544529761, 0.8449756031299384], "pathCommand": 5 }, { "segmentData": [0.7898325792515928, 0.5278465421856228], "pathCommand": 1 }, { "segmentData": [0.8361614207767981, 0.5585737710833404, 0.8654059040184102, 0.6228047336417235, 0.8649897973921206, 0.6929591224314721], "pathCommand": 5 }, { "segmentData": [0.9671259164331727, 0.3519979490596724], "pathCommand": 1 }, { "segmentData": [0.9596125187450409, 0.3758763581735799, 0.9481690444518895, 0.39707071905279345, 0.9336507786685759, 0.4139151792559731], "pathCommand": 5 }, { "segmentData": [0.8868132720328745, 0.12228418401333935], "pathCommand": 1 }, { "segmentData": [0.8880848331709551, 0.13193270731973805, 0.8886859551274976, 0.14172007747132512, 0.8885703586603995, 0.15153057435908296], "pathCommand": 5 }, { "segmentData": [0.6730626318395155, 0.08817880949957878], "pathCommand": 1 }, { "segmentData": [0.6774319885712632, 0.07468937537861838, 0.6831884012700298, 0.06212545725000132, 0.6902163412274901, 0.05088039905035615], "pathCommand": 5 }, { "segmentData": [0.5126918449911004, 0.10594877129040778], "pathCommand": 1 }, { "segmentData": [0.5144719357221305, 0.09479627549351742, 0.517269255035993, 0.08399083558964858, 0.5209912444484813, 0.0737869933247928], "pathCommand": 5 }, { "segmentData": [0.3244867704891435, 0.11686989169038581], "pathCommand": 1 }, { "segmentData": [0.33539854168890704, 0.12556977226827043, 0.3454780657567047, 0.13605127581294152, 0.3545403951210566, 0.148059871381928], "pathCommand": 5 }, { "segmentData": [0.09624097703001304, 0.3620629768899013], "pathCommand": 1 }, { "segmentData": [0.09385980838564281, 0.35132695680745313, 0.09210282339627772, 0.3403595541257457, 0.09099315490709205, 0.32923020667206704], "pathCommand": 5 }] }];
        for (var i = 0; i < paths.length; i++) {
            for (var j = 0; j < paths[i].data.length; j++) {
                var len = paths[i].data[j].pathCommand == 3 ? 2 : paths[i].data[j].segmentData.length;
                for (var k = 0; k < len; k++) {
                    if (k % 2 == 0) {
                        paths[i].data[j].segmentData[k] *= rect.width;
                    }
                    else {
                        paths[i].data[j].segmentData[k] *= rect.height;
                    }
                }
            }
        }
        createPaths(ctx, paths, rect, needFill, needStroke);
    }
    function createHeart(ctx, rect) {
        let width = rect.width;
        let height = rect.height;
        let x = rect.x;
        let y = rect.y;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y + height / 5);
        ctx.bezierCurveTo(x + width / 2 - width / 16, y, x + width / 5, y, x + width / 5, y);
        ctx.bezierCurveTo(x + width / 5, y, x, y, x, y + height / 4);
        ctx.bezierCurveTo(x, y + height / 2, x + width / 4, y + 3 * height / 4, x + width / 2, y + height);
        ctx.bezierCurveTo(x + 3 * width / 4, y + 3 * height / 4, x + width, y + height / 2, x + width, y + height / 4);
        ctx.bezierCurveTo(x + width, y, x + 4 * width / 5, y, x + 4 * width / 5, y);
        ctx.bezierCurveTo(x + 4 * width / 5, y, x + width / 2 + width / 16, y, x + width / 2, y + height / 5);
        ctx.closePath();
    }
    function createCutTopBottomRect(ctx, adjustValues, rect) {
        let radius1 = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        let radius2 = Math.min(rect.width, rect.height) * adjustValues[1].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y + radius1);
        ctx.lineTo(rect.x + radius1, rect.y);
        ctx.lineTo(rect.right - radius1, rect.y);
        ctx.lineTo(rect.right, rect.y + radius1);
        ctx.lineTo(rect.right, rect.bottom - radius2);
        ctx.lineTo(rect.right - radius2, rect.bottom);
        ctx.lineTo(rect.x + radius2, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom - radius2);
        ctx.lineTo(rect.x, rect.y + radius1);
        ctx.closePath();
    }
    function createCutDiagonalRect(ctx, adjustValues, rect) {
        let radius1 = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        let radius2 = Math.min(rect.width, rect.height) * adjustValues[1].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y + radius1);
        ctx.lineTo(rect.x + radius1, rect.y);
        ctx.lineTo(rect.right - radius2, rect.y);
        ctx.lineTo(rect.right, rect.y + radius2);
        ctx.lineTo(rect.right, rect.bottom - radius1);
        ctx.lineTo(rect.right - radius1, rect.bottom);
        ctx.lineTo(rect.x + radius2, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom - radius2);
        ctx.lineTo(rect.x, rect.y + radius1);
        ctx.closePath();
    }
    function createPlaceque(ctx, adjustValues, rect) {
        let radius = Math.min(rect.width, rect.height) * adjustValues[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + radius, rect.y);
        ctx.lineTo(rect.right - radius, rect.y);
        ctx.arc(rect.right, rect.y, radius, Math.PI, Math.PI / 2, true);
        ctx.lineTo(rect.right, rect.bottom - radius);
        ctx.arc(rect.right, rect.bottom, radius, 3 * Math.PI / 2, Math.PI, true);
        ctx.lineTo(rect.x + radius, rect.bottom);
        ctx.arc(rect.x, rect.bottom, radius, 0, -Math.PI / 2, true);
        ctx.lineTo(rect.x, rect.y + radius);
        ctx.arc(rect.x, rect.y, radius, Math.PI / 2, 0, true);
        ctx.closePath();
    }
    function createTriangle(ctx, rect) {
        ctx.beginPath();
        ctx.moveTo(rect.centerX, rect.y);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.closePath();
    }
    function createPlusSign(ctx, adjusts, rect) {
        let bodyW = Math.min(rect.height, rect.width) * adjusts[0].rawValue / 200000;
        rect = createRect(rect.x + rect.width / 8, rect.y + rect.height / 8, 6 * rect.width / 8, 6 * rect.height / 8);
        ctx.beginPath();
        ctx.moveTo(rect.centerX - bodyW, rect.centerY - bodyW);
        ctx.lineTo(rect.centerX - bodyW, rect.y);
        ctx.lineTo(rect.centerX + bodyW, rect.y);
        ctx.lineTo(rect.centerX + bodyW, rect.centerY - bodyW);
        ctx.lineTo(rect.right, rect.centerY - bodyW);
        ctx.lineTo(rect.right, rect.centerY + bodyW);
        ctx.lineTo(rect.centerX + bodyW, rect.centerY + bodyW);
        ctx.lineTo(rect.centerX + bodyW, rect.bottom);
        ctx.lineTo(rect.centerX - bodyW, rect.bottom);
        ctx.lineTo(rect.centerX - bodyW, rect.centerY + bodyW);
        ctx.lineTo(rect.x, rect.centerY + bodyW);
        ctx.lineTo(rect.x, rect.centerY - bodyW);
        ctx.lineTo(rect.centerX - bodyW, rect.centerY - bodyW);
        ctx.closePath();
    }
    function createMinusSign(ctx, adjusts, rect) {
        let bodyW = rect.height * adjusts[0].rawValue / 200000;
        rect = createRect(rect.x + rect.width / 8, rect.centerY - bodyW, 6 * rect.width / 8, 2 * bodyW);
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.closePath();
    }
    function createMultiplicationSign(ctx, adjusts, rect) {
        let dy = rect.height * adjusts[0].rawValue / 200000;
        let line1 = getLineEquation({ x: rect.x, y: rect.y }, { x: rect.right, y: rect.bottom });
        line1 = getParallelLine(line1, rect.x, dy + rect.y);
        let line2 = getParallelLine(line1, rect.right, rect.bottom - dy);
        let line3 = getLineEquation({ x: rect.right, y: rect.y }, { x: rect.x, y: rect.bottom });
        line3 = getParallelLine(line3, rect.x, rect.bottom - dy);
        let line4 = getParallelLine(line3, rect.right, rect.y + dy);
        let points = [];
        let line5 = getPerpendicularLine(line3, (rect.right - rect.width / 4), rect.y + rect.height / 4);
        let p1 = getLineIntersect(line2, line3);
        let p2 = getLineIntersect(line3, line5);
        let p3 = getLineIntersect(line4, line5);
        let p4 = getLineIntersect(line2, line4);
        points.push(p1);
        points.push(p2);
        points.push(p3);
        points.push(p4);
        points.push({ x: p3.x, y: 2 * rect.centerY - p3.y });
        points.push({ x: p2.x, y: 2 * rect.centerY - p2.y });
        points.push({ x: p1.x, y: 2 * rect.centerY - p1.y });
        points.push({ x: 2 * rect.centerX - p2.x, y: 2 * rect.centerY - p2.y });
        points.push({ x: 2 * rect.centerX - p3.x, y: 2 * rect.centerY - p3.y });
        points.push({ x: 2 * rect.centerX - p4.x, y: p4.y });
        points.push({ x: 2 * rect.centerX - p3.x, y: p3.y });
        points.push({ x: 2 * rect.centerX - p2.x, y: p2.y });
        createPolygon(ctx, points);
    }
    function createEqualSign(ctx, adjusts, rect) {
        let height = rect.height * adjusts[0].rawValue / 100000;
        let centerY = rect.height * adjusts[1].rawValue / 200000;
        ctx.beginPath();
        ctx.moveTo(rect.x + rect.width / 8, rect.centerY - centerY - height);
        ctx.rect(rect.x + rect.width / 8, rect.centerY - centerY - height, 3 * rect.width / 4, height);
        ctx.moveTo(rect.x + rect.width / 8, rect.centerY + centerY);
        ctx.rect(rect.x + rect.width / 8, rect.centerY + centerY, 3 * rect.width / 4, height);
    }
    function createNotEqualSign(ctx, adjusts, rect) {
        let height = rect.height * adjusts[0].rawValue / 100000;
        let angle = adjusts[1].angleValue;
        let centerY = rect.height * adjusts[2].rawValue / 200000;
        let v = { x: rect.centerX + rect.height / 2, y: 0 };
        v = vectorRotate(v, angle);
        let v1 = vectorRotate(v, 90);
        v1 = vectorNormalize(v1);
        v1.x *= height / 2;
        v1.y *= height / 2;
        let points = [];
        let p1 = { x: rect.centerX + v.x + v1.x, y: rect.centerY + v.y + v1.y };
        let p2 = { x: rect.centerX - v.x + v1.x, y: rect.centerY - v.y + v1.y };
        let p3 = { x: rect.centerX - v.x - v1.x, y: rect.centerY - v.y - v1.y };
        let p4 = { x: rect.centerX + v.x - v1.x, y: rect.centerY + v.y - v1.y };
        let line1 = getLineEquation(p1, p2);
        let line2 = getLineEquation(p3, p4);
        points.push({ x: rect.x + rect.width / 8, y: rect.centerY - centerY - height });
        points.push(getLineIntersect(line1, [0, -1, rect.centerY - centerY - height]));
        points.push(p2);
        points.push(p3);
        points.push(getLineIntersect(line2, [0, -1, rect.centerY - centerY - height]));
        points.push({ x: rect.right - rect.width / 8, y: rect.centerY - centerY - height });
        points.push({ x: rect.right - rect.width / 8, y: rect.centerY - centerY });
        points.push(getLineIntersect(line2, [0, -1, rect.centerY - centerY]));
        points.push(getLineIntersect(line2, [0, -1, rect.centerY + centerY]));
        points.push({ x: rect.right - rect.width / 8, y: rect.centerY + centerY });
        points.push({ x: rect.right - rect.width / 8, y: rect.centerY + centerY + height });
        points.push(getLineIntersect(line2, [0, -1, rect.centerY + centerY + height]));
        points.push(p4);
        points.push(p1);
        points.push(getLineIntersect(line1, [0, -1, rect.centerY + centerY + height]));
        points.push({ x: rect.x + rect.width / 8, y: rect.centerY + centerY + height });
        points.push({ x: rect.x + rect.width / 8, y: rect.centerY + centerY });
        points.push(getLineIntersect(line1, [0, -1, rect.centerY + centerY]));
        points.push(getLineIntersect(line1, [0, -1, rect.centerY - centerY]));
        points.push({ x: rect.x + rect.width / 8, y: rect.centerY - centerY });
        createPolygon(ctx, points);
    }
    function createPolygon(ctx, points) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
    }
    function createDivisionSign(ctx, adjusts, rect) {
        let height = rect.height * adjusts[0].rawValue / 100000;
        let centerY = rect.height * adjusts[1].rawValue / 100000;
        let radius = rect.height * adjusts[2].rawValue / 100000;
        centerY += radius + height / 2;
        ctx.beginPath();
        ctx.rect(rect.x + rect.width / 8, rect.centerY - height / 2, 3 * rect.width / 4, height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rect.centerX + radius, rect.centerY - centerY);
        ctx.arc(rect.centerX, rect.centerY - centerY, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rect.centerX + radius, rect.centerY + centerY);
        ctx.arc(rect.centerX, rect.centerY + centerY, radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    function createLeftArrow(ctx, adjusts, rect) {
        let dx = rect.height * adjusts[1].rawValue / 100000;
        let dy = rect.height / 2 - (rect.height / 2) * adjusts[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.right, rect.y + dy);
        ctx.lineTo(rect.x + dx, rect.y + dy);
        ctx.lineTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.lineTo(rect.x + dx, rect.bottom - dy);
        ctx.lineTo(rect.right, rect.bottom - dy);
        ctx.lineTo(rect.right, rect.y + dy);
        ctx.closePath();
    }
    function createRightArrow(ctx, adjusts, rect) {
        let dx = rect.height * adjusts[1].rawValue / 100000;
        let dy = rect.height / 2 - (rect.height / 2) * adjusts[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.right - dx, rect.bottom - dy);
        ctx.lineTo(rect.x, rect.bottom - dy);
        ctx.lineTo(rect.x, rect.y + dy);
        ctx.closePath();
    }
    function createStripedRightArrow(ctx, adjusts, rect) {
        let dx = rect.height * adjusts[1].rawValue / 100000;
        let dy = rect.height / 2 - (rect.height / 2) * adjusts[0].rawValue / 100000;
        let w = 0.01946 * rect.width;
        ctx.beginPath();
        ctx.rect(rect.x, rect.y + dy, w, rect.height - 2 * dy);
        ctx.rect(rect.x + 2 * w, rect.y + dy, 2 * w, rect.height - 2 * dy);
        ctx.moveTo(rect.x + 5 * w, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.right - dx, rect.bottom - dy);
        ctx.lineTo(rect.x + 5 * w, rect.bottom - dy);
        ctx.lineTo(rect.x + 5 * w, rect.y + dy);
        ctx.closePath();
    }
    function createNotchedRightArrow(ctx, adjusts, rect) {
        let dx = rect.height * adjusts[1].rawValue / 100000;
        let dy = rect.height / 2 - (rect.height / 2) * adjusts[0].rawValue / 100000;
        let line = getLineEquation({ x: rect.right - dx, y: rect.y }, { x: rect.right, y: rect.centerY });
        line = getParallelLine(line, rect.x, rect.y + dy);
        let p = { x: getLineX(line, rect.centerY), y: rect.centerY }
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.right - dx, rect.bottom - dy);
        ctx.lineTo(rect.x, rect.bottom - dy);
        ctx.lineTo(p.x, p.y);
        ctx.lineTo(rect.x, rect.y + dy);
        ctx.closePath();
    }
    function createPentagonArrow(ctx, adjusts, rect) {
        let dx = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y);
        ctx.closePath();
    }
    function createChevronArrow(ctx, adjusts, rect) {
        let dx = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 100000;
        let line = getLineEquation({ x: rect.right - dx, y: rect.y }, { x: rect.right, y: rect.centerY });
        line = getParallelLine(line, rect.x, rect.y);
        let p = { x: getLineX(line, rect.centerY), y: rect.centerY };
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(p.x, p.y);
        ctx.lineTo(rect.x, rect.y);
        ctx.closePath();
    }
    function createCallOutLeftArrow(ctx, adjusts, rect) {
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let footH = rect.width * adjusts[3].rawValue / 100000;
        footH = Math.min(rect.width * 2 / 3, footH);
        if (headH > rect.width - footH) {
            headH = rect.width - footH;
        }
        ctx.beginPath();
        ctx.moveTo(rect.right, rect.y);
        ctx.lineTo(rect.right - footH, rect.y);
        ctx.lineTo(rect.right - footH, rect.centerY - bodyW);
        ctx.lineTo(rect.x + headH, rect.centerY - bodyW);
        ctx.lineTo(rect.x + headH, rect.centerY - headW);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.x + headH, rect.centerY + headW);
        ctx.lineTo(rect.x + headH, rect.centerY + bodyW);
        ctx.lineTo(rect.right - footH, rect.centerY + bodyW);
        ctx.lineTo(rect.right - footH, rect.bottom);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.closePath();
    }
    function createCallOutRightArrow(ctx, adjusts, rect) {
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let footH = rect.width * adjusts[3].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.x + footH, rect.y);
        ctx.lineTo(rect.x + footH, rect.centerY - bodyW);
        ctx.lineTo(rect.right - headH, rect.centerY - bodyW);
        ctx.lineTo(rect.right - headH, rect.centerY - headW);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - headH, rect.centerY + headW);
        ctx.lineTo(rect.right - headH, rect.centerY + bodyW);
        ctx.lineTo(rect.x + footH, rect.centerY + bodyW);
        ctx.lineTo(rect.x + footH, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.closePath();
    }
    function createCallOutQuadArrow(ctx, adjusts, rect) {
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let footH = Math.min(rect.width, rect.height) * adjusts[3].rawValue / 200000;
        ctx.beginPath();
        ctx.moveTo(rect.centerX - footH, rect.centerY - bodyW);
        ctx.lineTo(rect.centerX - footH, rect.centerY - footH);
        ctx.lineTo(rect.centerX - bodyW, rect.centerY - footH);
        ctx.lineTo(rect.centerX - bodyW, rect.y + headH);
        ctx.lineTo(rect.centerX - headW, rect.y + headH);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.lineTo(rect.centerX + headW, rect.y + headH);
        ctx.lineTo(rect.centerX + bodyW, rect.y + headH);
        ctx.lineTo(rect.centerX + bodyW, rect.centerY - footH);
        ctx.lineTo(rect.centerX + footH, rect.centerY - footH);
        ctx.lineTo(rect.centerX + footH, rect.centerY - bodyW);
        ctx.lineTo(rect.right - headH, rect.centerY - bodyW);
        ctx.lineTo(rect.right - headH, rect.centerY - headW);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - headH, rect.centerY + headW);
        ctx.lineTo(rect.right - headH, rect.centerY + bodyW);
        ctx.lineTo(rect.centerX + footH, rect.centerY + bodyW);
        ctx.lineTo(rect.centerX + footH, rect.centerY + footH);
        ctx.lineTo(rect.centerX + bodyW, rect.centerY + footH);
        ctx.lineTo(rect.centerX + bodyW, rect.bottom - headH);
        ctx.lineTo(rect.centerX + headW, rect.bottom - headH);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(rect.centerX - headW, rect.bottom - headH);
        ctx.lineTo(rect.centerX - bodyW, rect.bottom - headH);
        ctx.lineTo(rect.centerX - bodyW, rect.centerY + footH);
        ctx.lineTo(rect.centerX - footH, rect.centerY + footH);
        ctx.lineTo(rect.centerX - footH, rect.centerY + bodyW);
        ctx.lineTo(rect.x + headH, rect.centerY + bodyW);
        ctx.lineTo(rect.x + headH, rect.centerY + headW);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.x + headH, rect.centerY - headW);
        ctx.lineTo(rect.x + headH, rect.centerY - bodyW);
        ctx.closePath();
    }
    function createCallOutLeftRightArrow(ctx, adjusts, rect) {
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let footH = rect.width * adjusts[3].rawValue / 200000;
        ctx.beginPath();
        ctx.moveTo(rect.centerX - footH, rect.centerY - bodyW);
        ctx.lineTo(rect.centerX - footH, rect.y);
        ctx.lineTo(rect.centerX + footH, rect.y);
        ctx.lineTo(rect.centerX + footH, rect.centerY - bodyW);
        ctx.lineTo(rect.right - headH, rect.centerY - bodyW);
        ctx.lineTo(rect.right - headH, rect.centerY - headW);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - headH, rect.centerY + headW);
        ctx.lineTo(rect.right - headH, rect.centerY + bodyW);
        ctx.lineTo(rect.centerX + footH, rect.centerY + bodyW);
        ctx.lineTo(rect.centerX + footH, rect.bottom);
        ctx.lineTo(rect.centerX - footH, rect.bottom);
        ctx.lineTo(rect.centerX - footH, rect.centerY + bodyW);
        ctx.lineTo(rect.x + headH, rect.centerY + bodyW);
        ctx.lineTo(rect.x + headH, rect.centerY + headW);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.x + headH, rect.centerY - headW);
        ctx.lineTo(rect.x + headH, rect.centerY - bodyW);
        ctx.closePath();
    }
    function createCallOutDownArrow(ctx, adjusts, rect) {
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let footH = rect.height * adjusts[3].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.lineTo(rect.x, rect.y + footH);
        ctx.lineTo(rect.centerX - bodyW, rect.y + footH);
        ctx.lineTo(rect.centerX - bodyW, rect.bottom - headH);
        ctx.lineTo(rect.centerX - headW, rect.bottom - headH);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(rect.centerX + headW, rect.bottom - headH);
        ctx.lineTo(rect.centerX + bodyW, rect.bottom - headH);
        ctx.lineTo(rect.centerX + bodyW, rect.y + footH);
        ctx.lineTo(rect.right, rect.y + footH);
        ctx.lineTo(rect.right, rect.y);
        ctx.closePath();
    }
    function createCallOutUpArrow(ctx, adjusts, rect) {
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let footH = rect.height * adjusts[3].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom - footH);
        ctx.lineTo(rect.centerX - bodyW, rect.bottom - footH);
        ctx.lineTo(rect.centerX - bodyW, rect.y + headH);
        ctx.lineTo(rect.centerX - headW, rect.y + headH);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.lineTo(rect.centerX + headW, rect.y + headH);
        ctx.lineTo(rect.centerX + bodyW, rect.y + headH);
        ctx.lineTo(rect.centerX + bodyW, rect.bottom - footH);
        ctx.lineTo(rect.right, rect.bottom - footH);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.closePath();
    }
    function createLeftRightArrow(ctx, adjusts, rect) {
        let dx = rect.height * adjusts[1].rawValue / 100000;
        let dy = rect.height / 2 - (rect.height / 2) * adjusts[0].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.centerY);
        ctx.lineTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.x + dx, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.right - dx, rect.bottom - dy);
        ctx.lineTo(rect.x + dx, rect.bottom - dy);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.closePath();
    }
    function createUpArrow(ctx, adjusts, rect) {
        let dx = rect.width / 2 - (rect.width / 2) * adjusts[0].rawValue / 100000;
        let dy = rect.width * adjusts[1].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + dx, rect.bottom);
        ctx.lineTo(rect.right - dx, rect.bottom);
        ctx.lineTo(rect.right - dx, rect.y + dy);
        ctx.lineTo(rect.right, rect.y + dy);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.lineTo(rect.x, rect.y + dy);
        ctx.lineTo(rect.x + dx, rect.y + dy);
        ctx.lineTo(rect.x + dx, rect.bottom);
        ctx.closePath();
    }
    function createDownArrow(ctx, adjusts, rect) {
        let dx = rect.width / 2 - (rect.width / 2) * adjusts[0].rawValue / 100000;
        let dy = rect.width * adjusts[1].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x + dx, rect.y);
        ctx.lineTo(rect.right - dx, rect.y);
        ctx.lineTo(rect.right - dx, rect.bottom - dy);
        ctx.lineTo(rect.right, rect.bottom - dy);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom - dy);
        ctx.lineTo(rect.x + dx, rect.bottom - dy);
        ctx.lineTo(rect.x + dx, rect.y);
        ctx.closePath();
    }
    function createUpDownArrow(ctx, adjusts, rect) {
        let dx = rect.width / 2 - (rect.width / 2) * adjusts[0].rawValue / 100000;
        let dy = rect.width * adjusts[1].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y + dy);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.lineTo(rect.right, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.y + dy);
        ctx.lineTo(rect.right - dx, rect.bottom - dy);
        ctx.lineTo(rect.right, rect.bottom - dy);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom - dy);
        ctx.lineTo(rect.x + dx, rect.bottom - dy);
        ctx.lineTo(rect.x + dx, rect.y + dy);
        ctx.lineTo(rect.x, rect.y + dy);
        ctx.closePath();
    }
    function createQuard(ctx, adjusts, rect) {
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        ctx.beginPath();
        ctx.moveTo(rect.centerX - headW, rect.y + headH);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.lineTo(rect.centerX + headW, rect.y + headH);
        ctx.lineTo(rect.centerX + bodyW, rect.y + headH);
        ctx.lineTo(rect.centerX + bodyW, rect.centerY - bodyW);
        ctx.lineTo(rect.right - headH, rect.centerY - bodyW);
        ctx.lineTo(rect.right - headH, rect.centerY - headW);
        ctx.lineTo(rect.right, rect.centerY);
        ctx.lineTo(rect.right - headH, rect.centerY + headW);
        ctx.lineTo(rect.right - headH, rect.centerY + bodyW);
        ctx.lineTo(rect.centerX + bodyW, rect.centerY + bodyW);
        ctx.lineTo(rect.centerX + bodyW, rect.bottom - headH);
        ctx.lineTo(rect.centerX + headW, rect.bottom - headH);
        ctx.lineTo(rect.centerX, rect.bottom);
        ctx.lineTo(rect.centerX - headW, rect.bottom - headH);
        ctx.lineTo(rect.centerX - bodyW, rect.bottom - headH);
        ctx.lineTo(rect.centerX - bodyW, rect.centerY + bodyW);
        ctx.lineTo(rect.x + headH, rect.centerY + bodyW);
        ctx.lineTo(rect.x + headH, rect.centerY + headW);
        ctx.lineTo(rect.x, rect.centerY);
        ctx.lineTo(rect.x + headH, rect.centerY - headW);
        ctx.lineTo(rect.x + headH, rect.centerY - bodyW);
        ctx.lineTo(rect.centerX - bodyW, rect.centerY - bodyW);
        ctx.lineTo(rect.centerX - bodyW, rect.y + headH);
        ctx.closePath();
    }
    function createLeftRightUp(ctx, adjusts, rect) {
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        headW = Math.max(bodyW, headW);
        let bottomY = rect.bottom - headW;
        ctx.beginPath();
        ctx.moveTo(rect.centerX - headW, rect.y + headH);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.lineTo(rect.centerX + headW, rect.y + headH);
        ctx.lineTo(rect.centerX + bodyW, rect.y + headH);
        ctx.lineTo(rect.centerX + bodyW, bottomY - bodyW);
        ctx.lineTo(rect.right - headH, bottomY - bodyW);
        ctx.lineTo(rect.right - headH, bottomY - headW);
        ctx.lineTo(rect.right, bottomY);
        ctx.lineTo(rect.right - headH, bottomY + headW);
        ctx.lineTo(rect.right - headH, bottomY + bodyW);
        ctx.lineTo(rect.x + headH, bottomY + bodyW);
        ctx.lineTo(rect.x + headH, bottomY + headW);
        ctx.lineTo(rect.x, bottomY);
        ctx.lineTo(rect.x + headH, bottomY - headW);
        ctx.lineTo(rect.x + headH, bottomY - bodyW);
        ctx.lineTo(rect.centerX - bodyW, bottomY - bodyW);
        ctx.lineTo(rect.centerX - bodyW, rect.y + headH);
        ctx.closePath();
    }
    function createLeftUp(ctx, adjusts, rect) {
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        headW = Math.max(bodyW, headW);
        let bottomY = rect.bottom - headW;
        let rightX = rect.right - headW;
        ctx.beginPath();
        ctx.moveTo(rightX - headW, rect.y + headH);
        ctx.lineTo(rightX, rect.y);
        ctx.lineTo(rightX + headW, rect.y + headH);
        ctx.lineTo(rightX + bodyW, rect.y + headH);
        ctx.lineTo(rightX + bodyW, bottomY + bodyW);
        ctx.lineTo(rect.x + headH, bottomY + bodyW);
        ctx.lineTo(rect.x + headH, bottomY + headW);
        ctx.lineTo(rect.x, bottomY);
        ctx.lineTo(rect.x + headH, bottomY - headW);
        ctx.lineTo(rect.x + headH, bottomY - bodyW);
        ctx.lineTo(rightX - bodyW, bottomY - bodyW);
        ctx.lineTo(rightX - bodyW, rect.y + headH);
        ctx.closePath();
    }
    function createBentUp(ctx, adjusts, rect) {
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        headW = Math.max(bodyW, headW);
        let rightX = rect.right - headW;
        ctx.beginPath();
        ctx.moveTo(rightX - headW, rect.y + headH);
        ctx.lineTo(rightX, rect.y);
        ctx.lineTo(rightX + headW, rect.y + headH);
        ctx.lineTo(rightX + bodyW, rect.y + headH);
        ctx.lineTo(rightX + bodyW, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom - 2 * bodyW);
        ctx.lineTo(rightX - bodyW, rect.bottom - 2 * bodyW);
        ctx.lineTo(rightX - bodyW, rect.y + headH);
        ctx.closePath();
    }
    function createBent(ctx, adjusts, rect) {
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let connerW = Math.min(rect.width, rect.height) * adjusts[3].rawValue / 100000;
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y + headW - bodyW + connerW);
        ctx.quadraticCurveTo(rect.x, rect.y + headW - bodyW, rect.x + connerW, rect.y + headW - bodyW);
        ctx.lineTo(rect.right - headH, rect.y + headW - bodyW);
        ctx.lineTo(rect.right - headH, rect.y);
        ctx.lineTo(rect.right, rect.y + headW);
        ctx.lineTo(rect.right - headH, rect.y + 2 * headW);
        ctx.lineTo(rect.right - headH, rect.y + headW + bodyW);
        if (2 * bodyW < connerW) {
            ctx.lineTo(rect.x + connerW, rect.y + headW + bodyW);
            ctx.quadraticCurveTo(rect.x + 2 * bodyW, rect.y + headW + bodyW, rect.x + 2 * bodyW, rect.y + headW + connerW);
        }
        else {
            ctx.lineTo(rect.x + 2 * bodyW, rect.y + headW + bodyW);
        }
        ctx.lineTo(rect.x + 2 * bodyW, rect.bottom);
        ctx.closePath();
    }
    function createUTurn(ctx, adjusts, rect) {
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 100000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let headTop = rect.height * adjusts[4].rawValue / 100000;
        let connerW = Math.min(rect.width, rect.height) * adjusts[3].rawValue / 100000;
        connerW = Math.min(connerW, rect.width / 2);
        if (connerW + headH > headTop) {
            headTop = connerW + headH;
        }
        headW = Math.max(bodyW, headW);
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y + connerW);
        ctx.quadraticCurveTo(rect.x, rect.y, rect.x + connerW, rect.y);
        ctx.lineTo(rect.right - headW + bodyW - connerW, rect.y);
        ctx.quadraticCurveTo(rect.right - headW + bodyW, rect.y, rect.right - headW + bodyW, rect.y + connerW);
        ctx.lineTo(rect.right - headW + bodyW, rect.y + headTop - headH);
        ctx.lineTo(rect.right, rect.y + headTop - headH);
        ctx.lineTo(rect.right - headW, rect.y + headTop);
        ctx.lineTo(rect.right - 2 * headW, rect.y + headTop - headH);
        ctx.lineTo(rect.right - headW - bodyW, rect.y + headTop - headH);

        if (2 * bodyW < connerW) {
            ctx.lineTo(rect.right - headW - bodyW, rect.y + connerW);
            ctx.quadraticCurveTo(rect.right - headW - bodyW, rect.y + 2 * bodyW, rect.right - headW + bodyW - connerW, rect.y + 2 * bodyW);
            ctx.lineTo(rect.x + connerW, rect.y + 2 * bodyW);
            ctx.quadraticCurveTo(rect.x + 2 * bodyW, rect.y + 2 * bodyW, rect.x + 2 * bodyW, rect.y + connerW);

        }
        else {
            ctx.lineTo(rect.right - headW - bodyW, rect.y + 2 * bodyW);
            ctx.lineTo(rect.x + 2 * bodyW, rect.y + 2 * bodyW);
        }
        ctx.lineTo(rect.x + 2 * bodyW, rect.bottom);
        ctx.closePath();
    }
    function createCurvedRight(ctx, adjusts, rect) {
        rect = createRect(rect.x - rect.width, rect.y, 2 * rect.width, rect.height);
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 200000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let a1 = rect.width / 2;
        let b1 = rect.height / 2 - headW / 2;
        var angle1 = Math.acos(headH / Math.sqrt(a1 * a1 + b1 * b1));
        let a2 = rect.width / 2 - bodyW;
        let b2 = rect.height / 2 - headW / 2 - bodyW;
        var angle2 = Math.acos(headH / Math.sqrt(a2 * a2 + b2 * b2));
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY - headW / 2, a1, b1, 0, -Math.PI / 2, angle1);
        ctx.lineTo(rect.centerX + headH, rect.bottom);
        ctx.lineTo(rect.centerX, rect.bottom - headW - bodyW / 2);
        ctx.lineTo(rect.centerX + headH, rect.bottom - 2 * headW - bodyW);
        ctx.ellipse(rect.centerX, rect.centerY - headW / 2, a2, b2, 0, angle2, -Math.PI / 2, true);
        ctx.closePath();
        /*
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 200000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let h = rect.height - bodyW - headW;
        let angle = Math.acos(-headH / rect.width);
        let angle1 = Math.PI + Math.asin(2 * bodyW / h);
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y + h / 2);
        ctx.ellipse(rect.right, rect.y + h / 2, rect.width, h / 2, 0, Math.PI, angle, true);
        let y = rect.y + bodyW + h / 2 + h * Math.sin(angle) / 2;
        ctx.lineTo(rect.right - headH, y - headW);
        ctx.lineTo(rect.right, rect.y + h + bodyW);
        ctx.lineTo(rect.right - headH, y + headW);
        ctx.ellipse(rect.right, rect.y + h / 2 + 2 * bodyW, rect.width, h / 2, 0, angle, Math.PI, false);
        ctx.lineTo(rect.x, rect.y + h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(rect.right, rect.y + h / 2, rect.width, h / 2, 0, Math.PI, 3 * Math.PI / 2, false);
        ctx.lineTo(rect.right, rect.y + 2 * bodyW);
        ctx.ellipse(rect.right, rect.y + h / 2 + 2 * bodyW, rect.width, h / 2, 0, 3 * Math.PI / 2, angle1, true);
        ctx.ellipse(rect.right, rect.y + h / 2, rect.width, h / 2, 0, 2 * Math.PI - angle1, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        var fillStyle = ctx.fillStyle;
        ctx.fillStyle = "rgb(0,0,0,0.2)";
        ctx.fill();
        ctx.fillStyle = fillStyle;
        ctx.stroke();*/
    }
    function createCurvedUp(ctx, adjusts, rect) {
        rect = createRect(rect.x, rect.y - rect.height, rect.width, 2 * rect.height);
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 200000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let a1 = rect.width / 2 - headW / 2;
        let b1 = rect.height / 2;
        var angle1 = Math.asin(headH / Math.sqrt(a1 * a1 + b1 * b1));
        let a2 = rect.width / 2 - headW / 2 - bodyW;
        let b2 = rect.height / 2 - bodyW;
        var angle2 = Math.asin(headH / Math.sqrt(a2 * a2 + b2 * b2));

        ctx.beginPath();
        ctx.ellipse(rect.centerX - headW / 2, rect.centerY, a1, b1, 0, Math.PI, angle1, true);
        ctx.lineTo(rect.right, rect.centerY + headH);
        ctx.lineTo(rect.right - headW - bodyW / 2, rect.centerY);
        ctx.lineTo(rect.right - 2 * headW - bodyW, rect.centerY + headH);
        ctx.ellipse(rect.centerX - headW / 2, rect.centerY, a2, b2, 0, angle2, Math.PI, false);
        ctx.closePath();
        /*
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 200000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let h = rect.width - bodyW - headW;
        let angle = Math.asin(headH / rect.height);
        let angle1 = Math.acos(2 * bodyW / h);
        ctx.beginPath();
        ctx.ellipse(rect.x + h / 2 + 2 * bodyW, rect.y, h / 2, rect.height, 0, Math.PI - angle1, angle, true);
        let x = rect.x + bodyW + h / 2 + h * Math.cos(angle) / 2;
        ctx.lineTo(x + headW, rect.y + headH);
        ctx.lineTo(rect.x + h + bodyW, rect.y);
        ctx.lineTo(x - headW, rect.y + headH);
        ctx.ellipse(rect.x + h / 2, rect.y, h / 2, rect.height, 0, angle, angle1, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.ellipse(rect.x + h / 2, rect.y, h / 2, rect.height, 0, Math.PI, Math.PI / 2, true);
        ctx.lineTo(rect.x + h / 2 + 2 * bodyW, rect.bottom);
        ctx.ellipse(rect.x + h / 2 + 2 * bodyW, rect.y, h / 2, rect.height, 0, Math.PI / 2, Math.PI, false);
        ctx.closePath();
        ctx.fill();
        var fillStyle = ctx.fillStyle;
        ctx.fillStyle = "rgb(0,0,0,0.2)";
        ctx.fill();
        ctx.fillStyle = fillStyle;
        ctx.stroke();*/

    }
    function createCurvedDown(ctx, adjusts, rect) {
        rect = createRect(rect.x, rect.y, rect.width, 2 * rect.height);
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 200000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let a1 = rect.width / 2 - headW / 2;
        let b1 = rect.height / 2;
        var angle1 = Math.asin(headH / Math.sqrt(a1 * a1 + b1 * b1));
        let a2 = rect.width / 2 - headW / 2 - bodyW;
        let b2 = rect.height / 2 - bodyW;
        var angle2 = Math.asin(headH / Math.sqrt(a2 * a2 + b2 * b2));

        ctx.beginPath();
        ctx.ellipse(rect.centerX - headW / 2, rect.centerY, a1, b1, 0, Math.PI, -angle1, false);
        ctx.lineTo(rect.right, rect.centerY - headH);
        ctx.lineTo(rect.right - headW - bodyW / 2, rect.centerY);
        ctx.lineTo(rect.right - 2 * headW - bodyW, rect.centerY - headH);
        ctx.ellipse(rect.centerX - headW / 2, rect.centerY, a2, b2, 0, -angle2, Math.PI, true);
        ctx.closePath();
        /*
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 200000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let h = rect.width - bodyW - headW;
        let angle = Math.asin(headH / rect.height);
        let angle1 = Math.acos(2 * bodyW / h);
        ctx.beginPath();
        ctx.ellipse(rect.x + h / 2, rect.bottom, h / 2, rect.height, 0, -Math.PI / 2, -angle);
        let x = rect.x + bodyW + h / 2 + h * Math.cos(angle) / 2;
        ctx.lineTo(x - headW, rect.bottom - headH);
        ctx.lineTo(rect.x + h + bodyW, rect.bottom);
        ctx.lineTo(x + headW, rect.bottom - headH);
        ctx.ellipse(rect.x + h / 2 + 2 * bodyW, rect.bottom, h / 2, rect.height, 0, -angle, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rect.x, rect.bottom);
        ctx.ellipse(rect.x + h / 2, rect.bottom, h / 2, rect.height, 0, -Math.PI, -angle1);
        ctx.ellipse(rect.x + h / 2 + 2 * bodyW, rect.bottom, h / 2, rect.height, 0, -Math.PI + angle1, -Math.PI, true);
        ctx.closePath();
        ctx.fill();
        var fillStyle = ctx.fillStyle;
        ctx.fillStyle = "rgb(0,0,0,0.2)";
        ctx.fill();
        ctx.fillStyle = fillStyle;
        ctx.stroke();*/

    }
    function createCurvedLeft(ctx, adjusts, rect) {
        rect = createRect(rect.x, rect.y, 2 * rect.width, rect.height);
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 200000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let a1 = rect.width / 2;
        let b1 = rect.height / 2 - headW / 2;
        var angle1 = Math.PI / 2 + Math.asin(headH / Math.sqrt(a1 * a1 + b1 * b1));
        let a2 = rect.width / 2 - bodyW;
        let b2 = rect.height / 2 - headW / 2 - bodyW;
        var angle2 = Math.PI / 2 + Math.asin(headH / Math.sqrt(a2 * a2 + b2 * b2));
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY - headW / 2, a1, b1, 0, 3 * Math.PI / 2, angle1, true);
        ctx.lineTo(rect.centerX - headH, rect.bottom);
        ctx.lineTo(rect.centerX, rect.bottom - headW - bodyW / 2);
        ctx.lineTo(rect.centerX - headH, rect.bottom - 2 * headW - bodyW);
        ctx.ellipse(rect.centerX, rect.centerY - headW / 2, a2, b2, 0, angle2, 3 * Math.PI / 2, false);
        ctx.closePath();
        /*
        let bodyW = Math.min(rect.width, rect.height) * adjusts[0].rawValue / 200000;
        let headW = Math.min(rect.width, rect.height) * adjusts[1].rawValue / 200000;
        let headH = Math.min(rect.width, rect.height) * adjusts[2].rawValue / 100000;
        let h = rect.height - bodyW - headW;
        let angle = Math.acos(headH / rect.width);
        let angle1 = Math.asin(2 * bodyW / h);

        ctx.beginPath();
        ctx.moveTo(rect.x, rect.y);
        ctx.ellipse(rect.x, rect.y + h / 2, rect.width, h / 2, 0, -Math.PI / 2, 0, false);
        ctx.lineTo(rect.right, rect.y + h / 2 + 2 * bodyW);
        ctx.ellipse(rect.x, rect.y + h / 2 + 2 * bodyW, rect.width, h / 2, 0, 0, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fill();
        var fillStyle = ctx.fillStyle;
        ctx.fillStyle = "rgb(0,0,0,0.2)";
        ctx.fill();
        ctx.fillStyle = fillStyle;

        ctx.beginPath();
        ctx.moveTo(rect.right, rect.y + h / 2 + 2 * bodyW);
        ctx.ellipse(rect.x, rect.y + h / 2 + 2 * bodyW, rect.width, h / 2, 0, 0, angle, false);
        let y = rect.y + bodyW + h / 2 + h * Math.sin(angle) / 2;
        ctx.lineTo(rect.x + headH, y + headW);
        ctx.lineTo(rect.x, rect.y + h + bodyW);
        ctx.lineTo(rect.x + headH, y - headW);
        ctx.ellipse(rect.x, rect.y + h / 2, rect.width, h / 2, 0, angle, angle1, true);
        ctx.ellipse(rect.x, rect.y + h / 2 + 2 * bodyW, rect.width, h / 2, 0, -angle1, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();*/
    }
    function createCircularArrowRight(ctx, adjusts, rect) {
        rect = createRect(rect.x - rect.width, rect.y, 2 * rect.width, rect.height);
        let headH = rect.width * 0.1; // rect.width * adjusts[0].rawValue / 100000;
        let headW = rect.height * 0.1; // rect.height * adjusts[1].rawValue / 100000;
        let bodyW = rect.height * 0.1; //rect.height * adjusts[2].rawValue / 200000;
        let a1 = rect.width / 2;
        let b1 = rect.height / 2 - headW / 2;
        var angle1 = Math.acos(headH / Math.sqrt(a1 * a1 + b1 * b1));
        let a2 = rect.width / 2 - bodyW;
        let b2 = rect.height / 2 - headW / 2 - bodyW;
        var angle2 = Math.acos(headH / Math.sqrt(a2 * a2 + b2 * b2));
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY - headW / 2, a1, b1, 0, -Math.PI / 2, angle1);
        ctx.lineTo(rect.centerX + headH, rect.bottom);
        ctx.lineTo(rect.centerX, rect.bottom - headW - bodyW / 2);
        ctx.lineTo(rect.centerX + headH, rect.bottom - 2 * headW - bodyW);
        ctx.ellipse(rect.centerX, rect.centerY - headW / 2, a2, b2, 0, angle2, -Math.PI / 2, true);
        ctx.closePath();

    }
    function createCircularArrowLeft(ctx, adjusts, rect) {
        rect = createRect(rect.x, rect.y, 2 * rect.width, rect.height);
        let headH = rect.width * 0.1; // rect.width * adjusts[0].rawValue / 100000;
        let headW = rect.height * 0.1; // rect.height * adjusts[1].rawValue / 100000;
        let bodyW = rect.height * 0.1; //rect.height * adjusts[2].rawValue / 200000;
        let a1 = rect.width / 2;
        let b1 = rect.height / 2 - headW / 2;
        var angle1 = Math.PI / 2 + Math.asin(headH / Math.sqrt(a1 * a1 + b1 * b1));
        let a2 = rect.width / 2 - bodyW;
        let b2 = rect.height / 2 - headW / 2 - bodyW;
        var angle2 = Math.PI / 2 + Math.asin(headH / Math.sqrt(a2 * a2 + b2 * b2));
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.centerY - headW / 2, a1, b1, 0, 3 * Math.PI / 2, angle1, true);
        ctx.lineTo(rect.centerX - headH, rect.bottom);
        ctx.lineTo(rect.centerX, rect.bottom - headW - bodyW / 2);
        ctx.lineTo(rect.centerX - headH, rect.bottom - 2 * headW - bodyW);
        ctx.ellipse(rect.centerX, rect.centerY - headW / 2, a2, b2, 0, angle2, 3 * Math.PI / 2, false);
        ctx.closePath();

    }
    function createCylinder(ctx, adjusts, rect) {
        let radius = rect.height * adjusts[0].rawValue / 200000;
        ctx.beginPath();
        ctx.setLineDash([10, 4]);
        ctx.ellipse(rect.centerX, rect.bottom - radius, rect.width / 2, radius, 0, Math.PI, 0, false);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.bottom - radius, rect.width / 2, radius, 0, 0, Math.PI, false);
        ctx.lineTo(rect.x, rect.y + radius);
        ctx.ellipse(rect.centerX, rect.y + radius, rect.width / 2, radius, 0, -Math.PI, Math.PI, false);
        ctx.moveTo(rect.right, rect.y + radius);
        ctx.lineTo(rect.right, rect.bottom - radius);
    }
    function createCube(ctx, adjusts, rect) {
        let h = rect.height * adjusts[0].rawValue / 100000;
        ctx.beginPath();
        ctx.setLineDash([10, 4]);
        ctx.moveTo(rect.x + h, rect.y);
        ctx.lineTo(rect.x + h, rect.bottom - h);
        ctx.lineTo(rect.right, rect.bottom - h);
        ctx.moveTo(rect.x + h, rect.bottom - h);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.rect(rect.x, rect.y + h, rect.width - h, rect.height - h);
        ctx.moveTo(rect.x, rect.y + h);
        ctx.lineTo(rect.x + h, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right - h, rect.y + h);
        ctx.moveTo(rect.right, rect.y);
        ctx.lineTo(rect.right, rect.bottom - h);
        ctx.lineTo(rect.right - h, rect.bottom);
    }
    function createPyramid(ctx, adjusts, rect) {
        let h1 = rect.width * adjusts[0].rawValue / 100000;
        let h2 = rect.height * adjusts[1].rawValue / 100000;
        let topX = rect.width * adjusts[2].rawValue / 100000;
        ctx.beginPath();
        ctx.setLineDash([10, 4]);
        ctx.moveTo(rect.x + topX, rect.y);
        ctx.lineTo(rect.x + h1, rect.bottom - h2);
        ctx.lineTo(rect.right, rect.bottom - h2);
        ctx.moveTo(rect.x + h1, rect.bottom - h2);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(rect.x + topX, rect.y);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.right - h1, rect.bottom);
        ctx.lineTo(rect.x + topX, rect.y);
        ctx.lineTo(rect.right, rect.bottom - h2);
        ctx.lineTo(rect.right - h1, rect.bottom);
    }
    function createTetrahedron(ctx, adjusts, rect) {
        let h1 = rect.width * adjusts[0].rawValue / 100000;
        let h2 = rect.height * adjusts[1].rawValue / 100000;
        let topX = rect.width * adjusts[2].rawValue / 100000;
        ctx.beginPath();
        ctx.setLineDash([10, 4]);
        ctx.moveTo(rect.x + topX, rect.y);
        ctx.lineTo(rect.x + h1, rect.bottom - h2);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.moveTo(rect.x + h1, rect.bottom - h2);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(rect.x + topX, rect.y);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x + topX, rect.y);
    }
    function createCone(ctx, adjusts, rect) {
        let h = rect.width * adjusts[0].rawValue / 100000
        ctx.beginPath();
        ctx.setLineDash([10, 4]);
        ctx.ellipse(rect.centerX, rect.bottom - h, rect.width / 2, h / 2, 0, Math.PI, 0);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.ellipse(rect.centerX, rect.bottom - h, rect.width / 2, h / 2, 0, 0, Math.PI);
        ctx.lineTo(rect.centerX, rect.y);
        ctx.lineTo(rect.right, rect.bottom - h);
    }
    function createBeveledRect(ctx, adjusts, rect) {
        let h = Math.min(rect.height, rect.width) * adjusts[0].rawValue / 100000;
        ctx.beginPath();
        ctx.rect(rect.x + h, rect.y + h, rect.width - 2 * h, rect.height - 2 * h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rect.x + h, rect.y + h);
        ctx.lineTo(rect.x, rect.y);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right - h, rect.y + h);
        ctx.lineTo(rect.x + h, rect.y + h);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rect.x + h, rect.y + h);
        ctx.lineTo(rect.x + h, rect.bottom - h);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y);
        ctx.lineTo(rect.x + h, rect.y + h);
        ctx.closePath();
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(rect.x + h, rect.y + h);
        ctx.lineTo(rect.x + h, rect.bottom - h);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x, rect.y);
        ctx.lineTo(rect.x + h, rect.y + h);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rect.x + h, rect.bottom - h);
        ctx.lineTo(rect.right - h, rect.bottom - h);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.x, rect.bottom);
        ctx.lineTo(rect.x + h, rect.bottom - h);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rect.right - h, rect.y + h);
        ctx.lineTo(rect.right, rect.y);
        ctx.lineTo(rect.right, rect.bottom);
        ctx.lineTo(rect.right - h, rect.bottom - h);
        ctx.lineTo(rect.right - h, rect.y + h);
        ctx.closePath();
        ctx.stroke();
    }
    function createPaths(ctx, paths, rect, needFill, needStroke) {
        var lastPoint = { x: 0, y: 0 };
        for (var path of paths) {
            var closed = false;
            ctx.beginPath();
            for (var segment of path.data) {
                var data = segment.segmentData;
                if (segment.pathCommand == 0) {
                    ctx.closePath();
                    closed = true;
                }
                else if (segment.pathCommand == 1) {
                    lastPoint.x = data[0] + rect.x;
                    lastPoint.y = data[1] + rect.y;
                    ctx.moveTo(lastPoint.x, lastPoint.y);
                }
                else if (segment.pathCommand == 2) {
                    lastPoint.x = data[0] + rect.x;
                    lastPoint.y = data[1] + rect.y;
                    ctx.lineTo(lastPoint.x, lastPoint.y);
                }
                else if (segment.pathCommand == 3) {
                    let startAngle = data[2] * Math.PI / 180;
                    let sweepAngle = data[3] * Math.PI / 180;
                    let rx = data[0];
                    let ry = data[1];
                    let cx = lastPoint.x - rx * Math.cos(startAngle);
                    let cy = lastPoint.y - ry * Math.sin(startAngle);
                    ctx.ellipse(cx, cy, rx, ry, 0, startAngle, startAngle + sweepAngle, sweepAngle <= 0);
                    lastPoint.x = cx + rx * Math.cos(startAngle + sweepAngle);
                    lastPoint.y = cy + ry * Math.sin(startAngle + sweepAngle);
                }
                else if (segment.pathCommand == 4) {
                    lastPoint.x = data[2] + rect.x;
                    lastPoint.y = data[3] + rect.y;
                    ctx.quadraticCurveTo(data[0] + rect.x, data[1] + rect.y, lastPoint.x, lastPoint.y);
                }
                else if (segment.pathCommand == 5) {
                    lastPoint.x = data[4] + rect.x;
                    lastPoint.y = data[5] + rect.y;
                    ctx.bezierCurveTo(data[0] + rect.x, data[1] + rect.y, data[2] + rect.x, data[3] + rect.y, lastPoint.x, lastPoint.y);
                }
            }
            if (needFill) {
                ctx.fill();
            }
            if (needStroke) {
                ctx.stroke();
            }
        }
    }
    function createRectange(ctx, rect) {
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
    }
    function createRect(x, y, width, height) {
        return { x: x, y: y, width: width, height: height, centerX: x + width / 2.0, centerY: y + height / 2.0, right: x + width, bottom: y + height };
    }
    function drawAutoShape(shape, rect, _context) {
        var needFill = false;
        var needStroke = true;
        if (needFill || needStroke) {
            if (shape.shapeType == 0) {
                //paths
                drawCustom(shape, rect, needFill, needStroke);
            }
            else if (shape.shapeType == 1) {
                //line
                _context.beginPath();
                _context.moveTo(shape.data[2] < shape.data[0] ? rect.right : rect.x, shape.data[3] < shape.data[1] ? rect.bottom : rect.y);
                _context.lineTo(shape.data[2] < shape.data[0] ? rect.x : rect.right, shape.data[3] < shape.data[1] ? rect.y : rect.bottom);
                _context.stroke();
            }
            else if (shape.shapeType == 2) {
                //line reverse
                _context.beginPath();
                _context.moveTo(shape.data[2] < shape.data[0] ? rect.right : rect.x, shape.data[3] < shape.data[1] ? rect.bottom : rect.y);
                _context.lineTo(shape.data[2] < shape.data[0] ? rect.x : rect.right, shape.data[3] < shape.data[1] ? rect.y : rect.bottom);
                _context.stroke();
            }
            else if (shape.shapeType == 3) {
                //triangle
                createTriangle(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                if (needStroke) {
                    _context.stroke();
                }
            }
            else if (shape.shapeType == 4) {
                //right triangle
                _context.beginPath();
                _context.moveTo(rect.x, rect.y);
                _context.lineTo(rect.right, rect.bottom);
                _context.lineTo(rect.x, rect.bottom);
                _context.lineTo(rect.x, rect.y);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 5) {
                //rect
                createRectange(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                if (needStroke) {
                    _context.stroke();
                }
            }
            else if (shape.shapeType == 6) {
                //diamon
                createDiamond(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 7) {
                //parallelogram
                createParallelogram(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 8) {
                //trapezoid
                createTrapezoid(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 10) {
                //Pentagon
                createPentagon(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 11) {
                //Hexagon
                createHexagon(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 12) {
                //Heptagon
                createHeptagon(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 13) {
                //Octagon
                createOctagon(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 14) {
                //Decagon
                createDecagon(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 15) {
                //Dodecagon
                createDodecagon(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 16) {
                //Star 4 points
                createStar4(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 17) {
                //Star 5 points
                createStar5(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 18) {
                //Star 6 points
                createStar6(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 19) {
                //Star 7 points
                createStar7(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 26) {
                //round conner rectangle
                createRoundRect(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 27) {
                //round right conner rectangle
                createRoundRightRect(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 28) {
                //round top-bottom conner rectangle
                createRoundTopBottomRect(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 29) {
                //round cross conner rectangle
                createRoundDiagonalRect(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 30) {
                //rectangle round left cut right
                createRoundLeftCutRightRect(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 31) {
                //rectangle cut right
                createCutRightRect(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 32) {
                //rectangle cut right
                createCutTopBottomRect(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 33) {
                //rectangle cut right
                createCutDiagonalRect(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 34) {
                //placeque
                createPlaceque(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 35) {
                //oval
                createEllipse(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 36) {
                //rectRight
                createTearDrop(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 37) {
                //rectRight
                createPentagonArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 38) {
                //rectRight
                createChevronArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 40) {
                //pie
                createPie(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 41) {
                //Block arc
                createBlockArc(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 42) {
                //wheel
                createWheel(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 43) {
                //Forbiden symbol
                createForbiden(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 44) {
                //right arrow
                createRightArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 45) {
                //left arrow
                createLeftArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 46) {
                //up arrow
                createUpArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 47) {
                //down arrow
                createDownArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 48) {
                //striped arrow right
                createStripedRightArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 49) {
                //striped arrow right
                createNotchedRightArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 50) {
                //bent up
                createBentUp(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 51) {
                //down arrow
                createLeftRightArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 52) {
                //down arrow
                createUpDownArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 53) {
                //left up
                createLeftUp(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 54) {
                //left right up
                createLeftRightUp(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 55) {
                //quard
                createQuard(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 56) {
                //Callout right arrow
                createCallOutLeftArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 57) {
                //Callout right arrow
                createCallOutRightArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 58) {
                //Callout right arrow
                createCallOutUpArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 59) {
                //Callout right arrow
                createCallOutDownArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 60) {
                //Callout left right arrow
                createCallOutLeftRightArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 62) {
                //Callout left right arrow
                createCallOutQuadArrow(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 63) {
                //quard
                createBent(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 64) {
                //u turn
                createUTurn(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 65) {
                //circular right
                createCircularArrowRight(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 66) {
                //circular left
                createCircularArrowLeft(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 68) {
                //curved right
                createCurvedRight(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 69) {
                //curved left
                createCurvedLeft(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 70) {
                //curved up
                createCurvedUp(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 71) {
                //curved down
                createCurvedDown(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 73) {
                //cube
                createCube(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 74) {
                //cylinder
                createCylinder(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 96) {
                //Pyramid
                createPyramid(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 97) {
                //Tetrahedron
                createTetrahedron(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 98) {
                //Cone
                createCone(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 75) {
                //Light bolt
                createLightBolt(_context, rect, needFill, needStroke);
            }
            else if (shape.shapeType == 76) {
                //Heart
                createHeart(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 77) {
                //Sun
                createSun(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 78) {
                //Moon
                createMoon(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 79) {
                //Face
                createFace(_context, shape.adjustValues, rect);
            }
            else if (shape.shapeType == 80) {
                //Explosion 8
                createExplosion8(_context, rect, needFill, needStroke);
            }
            else if (shape.shapeType == 81) {
                //Explosion 14
                createExplosion14(_context, rect, needFill, needStroke);
            }
            else if (shape.shapeType == 82) {
                //BeveledRect
                createFoldedConnerRect(_context, shape.adjustValues, rect);
            }
            else if (shape.shapeType == 83) {
                //BeveledRect
                createBeveledRect(_context, shape.adjustValues, rect);
            }
            else if (shape.shapeType == 84) {
                //Frame
                createFrame(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 85) {
                //HalfFrame
                createHalfFrame(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 86) {
                //LSHAPE
                createLShape(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 87) {
                //Diagonal Stripe
                createDiagonalStripe(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 88) {
                //ellipse cut
                createChord(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 89) {
                //ellipse cut
                createArc(_context, shape.adjustValues, rect);
                _context.stroke();
            }
            else if (shape.shapeType == 90) {
                //Left Bracket
                createLeftBracket(_context, shape.adjustValues, rect);
            }
            else if (shape.shapeType == 91) {
                //Right Bracket
                createRightBracket(_context, shape.adjustValues, rect);
            }
            else if (shape.shapeType == 92) {
                //Left Bracket
                createLeftBrace(_context, shape.adjustValues, rect);
            }
            else if (shape.shapeType == 93) {
                //Right Bracket
                createRightBrace(_context, shape.adjustValues, rect);
            }
            else if (shape.shapeType == 94) {
                //Double Bracket
                createDoubleBracket(_context, shape.adjustValues, rect);
            }
            else if (shape.shapeType == 95) {
                //Double Brace
                createDoubleBrace(_context, shape.adjustValues, rect);
                _context.stroke();
            }
            else if (shape.shapeType == 121) {
                //Clouds
                createClouds(_context, rect, needFill, needStroke);
            }
            else if (shape.shapeType == 131) {
                //extract flow
                createCross(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 132) {
                //process flow
                createProcessFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 133) {
                //decision flow
                createDecisionFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 134) {
                //Data flow
                createDataFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 135) {
                //Predefine process flow
                createPredefineProcessFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 136) {
                //Internal storeage flow
                createInternalStorageFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 137) {
                //document flow
                createDocumentFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 138) {
                //multiple document flow
                createMultiDocumentFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 139) {
                //terminator flow
                createTerminatorFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 140) {
                //Preparation flow
                createPreparationFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 141) {
                //Manual input flow
                createManualInputFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 142) {
                //Manual operation flow
                createManualOperationFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 143) {
                //Connector flow
                createConnectorFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 144) {
                //Card flow
                createCardFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 145) {
                //PunchedTape flow
                createPunchedTapeFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 146) {
                //SwimmingJunction flow
                createSwimmingJunctionFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 147) {
                //Or flow
                createOrFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 148) {
                //Collate flow
                createCollateFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 149) {
                //Sort flow
                createSortFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 150) {
                //extract flow
                createTriangle(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 151) {
                //Merge flow
                createMergeFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 153) {
                //StoredData flow
                createStoredDataFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 154) {
                //SequentialAccessStorage flow
                createSequentialAccessStorageFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 155) {
                //MagneticDisk flow
                createMagneticDiskFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 156) {
                //DirectAccess flow
                createDirectAccessStorageFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 157) {
                //Display flow
                createDisplayFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 158) {
                //StoredData flow
                createDelayFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 159) {
                //alt process flow
                createAltProcessFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 160) {
                //Offpage Connector flow
                createOffpageConnectorFlow(_context, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 176) {
                //plus sign
                createPlusSign(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 177) {
                //minus sign
                createMinusSign(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 178) {
                //multiplication sign
                createMultiplicationSign(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 179) {
                //Division sign
                createDivisionSign(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 180) {
                //Equals sign
                createEqualSign(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
            else if (shape.shapeType == 181) {
                //notequals sign
                createNotEqualSign(_context, shape.adjustValues, rect);
                if (needFill) {
                    _context.fill();
                }
                _context.stroke();
            }
        }
        //
        if (shape.textFrame != null) {
            drawTextFrame(shape, shape.textFrame, rect);
        }
    }
    this.data = data;
    this.lineWidth = data.length > 4 ? data[4] : 1;
    this.shapeType = data.length > 5 ? data[5] : 1;
    this.rotate = data.length > 6 ? data[6] : 0;
    this.flipX = data.length > 7 ? data[7] : 0;
    this.flipX = data.length > 8 ? data[8] : 0;
    this.adjustValues = [{ rawValue: 0.5, angleValue: 0 }];
    this.type = GraphType.shape;
    this.draw = function (ctx, centerX, centerY, axis) {
        var x1 = Math.min(data[0], data[2]);
        var y1 = Math.min(data[1], data[3]);
        var x2 = Math.max(data[0], data[2]);
        var y2 = Math.max(data[1], data[3]);
        var rect = createRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
        this.lineWidth = data.length > 4 ? data[4] : 1;
        this.shapeType = data.length > 5 ? data[5] : 1;
        this.rotate = data.length > 6 ? data[6] : 0;
        this.flipX = data.length > 7 ? data[7] : 0;
        this.flipX = data.length > 8 ? data[8] : 0;
        if (data.length > 9) {
            if (data.length > 9) {
                this.adjustValues[0] = { rawValue: data[9], angleValue: data[9] };
            }
            if (data.length > 10) {
                this.adjustValues[1] = { rawValue: data[10], angleValue: data[10] };
            }
            if (data.length > 11) {
                this.adjustValues[2] = { rawValue: data[11], angleValue: data[11] };
            }
            if (data.length > 12) {
                this.adjustValues[3] = { rawValue: data[12], angleValue: data[12] };
            }
            if (data.length > 13) {
                this.adjustValues[4] = { rawValue: data[13], angleValue: data[13] };
            }
        }
        ctx.save();
        ctx.translate(rect.centerX, rect.centerY);
        if (this.flipX == 1 || this.flipY == 1) {
            var scaleX = this.flipX == 1 ? -1 : 1;
            var scaleY = this.flipY == 1 ? -1 : 1;
            ctx.scale(scaleX, scaleY);
        }
        if (this.rotate != 0) {
            ctx.rotate(this.rotate);
        }
        ctx.lineWidth = data[4];
        drawAutoShape(this, createRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height), ctx);
        ctx.restore();
    }
    this.toData = function () {
        var d = {
            shapeType: this.shapeType,
            data: this.data,
            type: this.type
        }
        return d;
    }

    this.getHandles = function () {
        const [left, top, right, bottom] = data;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const angle = data[6];

        return [
            mathUtils.rotatePoint(left, top, centerX, centerY, angle),
            mathUtils.rotatePoint(right, top, centerX, centerY, angle),
            mathUtils.rotatePoint(left, bottom, centerX, centerY, angle),
            mathUtils.rotatePoint(right, bottom, centerX, centerY, angle)
        ];
    }

    this.getRotation = function () {
        return this.data[6];
    }
    this.getRotationHandle = function () {
        const [left, top, right, bottom] = data;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const angle = data[6];
        const handleDistance = Math.max(right - left, bottom - top) / 2 + rotationHandleRadius * 2;

        return mathUtils.rotatePoint(centerX, centerY - handleDistance, centerX, centerY, angle);
    }
    this.isInsideShape = function (x, y) {
        const [left, top, right, bottom] = data;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const angle = -data[6]; // Inverse of the rotation
        const rotatedPoint = mathUtils.rotatePoint(x, y, centerX, centerY, angle);
        const [rotatedX, rotatedY] = [rotatedPoint.x, rotatedPoint.y];
        return rotatedX >= left && rotatedX <= right && rotatedY >= top && rotatedY <= bottom;
    }
    this.getCenter = function () {
        const centerX = (data[0] + data[2]) / 2;
        const centerY = (data[1] + data[3]) / 2;
        return { x: centerX, y: centerY };
    }
    this.moveShape = function (deltaX, deltaY) {
        data[0] += deltaX;
        data[1] += deltaY;
        data[2] += deltaX;
        data[3] += deltaY;
    }
    this.getDragOffset = function (offsetX, offsetY) {
        const centerX = (data[0] + data[2]) / 2;
        const centerY = (data[1] + data[3]) / 2;
        const rotatedPoint = mathUtils.rotatePoint(offsetX, offsetY, centerX, centerY, -data[6]);
        const dragOffsetX = rotatedPoint.x - Math.min(data[0], data[2]);
        const dragOffsetY = rotatedPoint.y - Math.min(data[1], data[3]);
        return { x: dragOffsetX, y: dragOffsetY };
    }
    this.rotateShape = function (angle) {
        data[6] = angle;
    }
    this.moveHandle = function (i, x, y) {
        var center = this.getCenter();
        var point = mathUtils.rotatePoint(x, y, center.x, center.y, -this.data[6]);
        x = point.x;
        y = point.y;
        switch (i) {
            case 0:
                data[0] = x;
                data[1] = y;
                break;
            case 1:
                data[2] = x;
                data[1] = y;
                break;
            case 2:
                data[0] = x;
                data[3] = y;
                break;
            case 3:
                data[2] = x;
                data[3] = y;
                break;
        }
    }
}
