window.addEventListener("load", function () {
    if ($ && $.fn.createEditor == null) {
        initHtmlEditor();
    }
});
function initHtmlEditor() {
    if (!document.querySelector("#code-beauty-script")) {
        var script = document.createElement("script");
        script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "/lib/codemirror/beautify-html.min.js";
        document.body.appendChild(script);
    }
    //if (document.querySelector("#code-mirror-style")==null) {
    //    var link = document.createElement("link");
    //    link.id = "code-mirror-style";
    //    link.rel = "stylesheet";
    //    link.href = "/lib/codemirror/codemirror.min.css";

    //    link = document.createElement("link");
    //    link.rel = "stylesheet";
    //    link.href = "/lib/codemirror/dracula.min.css";


    //    var script = document.createElement("script");
    //    script.type = "text/javascript";
    //    script.src = "/lib/codemirror/codemirror.min.js";
    //    document.body.appendChild(script);
    //    script.onload = function () {

    //        var script = document.createElement("script");
    //        script.type = "text/javascript";
    //        script.src = "/lib/codemirror/xml.min.js";
    //        document.body.appendChild(script);

    //        script = document.createElement("script");
    //        script.type = "text/javascript";
    //        script.src = "/lib/codemirror/javascript.min.js";
    //        document.body.appendChild(script);

    //        script = document.createElement("script");
    //        script.type = "text/javascript";
    //        script.src = "/lib/codemirror/css.min.js";
    //        document.body.appendChild(script);

    //        script = document.createElement("script");
    //        script.type = "text/javascript";
    //        script.src = "/lib/codemirror/htmlmixed.min.js";
    //        document.body.appendChild(script);
    //    }
    //}
    $.fn.createEditor = function (options = {
        titleAxis: "",
        titleNoAxis: "",
        titleDeleteColumns: "",
        titleDeleteRows: "",
        titleInsertColumnRight: "",
        titleInsertExpression: "",
        titleInsertGraph: "",
        titleInsertRowBelows: "",
        titleInsertTable: "",
        titleMergeCells: "",
        titleGrid: "",
        titleUndo: "",
        titleRedo: "",
        titlePointer: "",
        titleFreeDrawing: "",
        titleLineDrawing: "",
        titlePolygonDrawing: "",
        titleRectangleDrawing: "",
        titleCircleDrawing: "",
        titleOvalDrawing: "",
        titleText: "",
        titleLineStyle: "",
        titleLineWidth: "",
        titleFunctionGraph: "",
        titleEraser: "",
        titleDelete: "",
        titleBold: "",
        titleItalic: "",
        titleAlignCenter: "",
        titleAlignLeft: "",
        titleAlignRight: "",
        titleAlignJustify: "",
        titleScanQRCode: "",
        titleSelectFile: "",
        onchange: null
    }) {
        const opts = options;
        for (var item of this) {
            item.textEditor = new TextEditor(item, opts);
        }
        if (!window.is__texvn__initEditorStatic) {
            window.is__texvn__initEditorStatic = true;
            const observer = new MutationObserver(function (mutationList, observer) {
                for (const mutation of mutationList) {
                    if (mutation.type === "attributes" && mutation.attributeName == "style") {
                        var margin = document.querySelector("body").style.paddingBottom;
                        var last = $(".text-editor-holder").last().parent();
                        last.css("margin-bottom", margin);
                        var marginNumber = parseFloat(margin.replace("px", ""));
                        if ($.fn.currentEditor && marginNumber > 0) {
                            $.fn.currentEditor.ensureViewVisible(marginNumber);
                        }
                    }
                }
            });
            const config = { attributes: true, childList: false, subtree: false };
            // Start observing the body to detect virtual keyboard show
            observer.observe(document.querySelector("body"), config);
        }
    }
}
const mathUtils = {
    distance: function (a, b) {
        var dx = (a.x - b.x);
        var dy = (a.y - b.y);
        return Math.sqrt(dx * dx + dy * dy);
    },
    rotateVector2: function (vec, ang) {
        ang = ang * (Math.PI / 180.0);
        let cos = Math.cos(ang);
        let sin = Math.sin(ang);
        let x = Math.round(10000 * (vec.x * cos - vec.y * sin)) / 10000;
        let y = Math.round(10000 * (vec.x * sin + vec.y * cos)) / 10000;
        return { x: x, y: y };
    },
    distanceToPoint: function (point, line) {
        // slope
        var m = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x);
        // y offset
        var b = line.p1.y - (m * line.p1.x);
        var d = [];
        // distance to the linear equation
        d.push(Math.abs(point.y - (m * point.x) - b) / Math.sqrt(Math.pow(m, 2) + 1))
        // distance to p1
        d.push(Math.sqrt(Math.pow((point.x - line.p1.x), 2) + Math.pow((point.y - line.p1.y), 2)))
        // distance to p2
        d.push(Math.sqrt(Math.pow((point.x - line.p2.x), 2) + Math.pow((point.y - line.p2.y), 2)));
        // return the smallest distance
        return d.sort(function (a, b) {
            return (a - b) //causes an array to be sorted numerically and ascending
        })[0];
    },
    convertMathMLToMathJax: function (content) {
        var i = 0;
        do {
            i = content.indexOf("<math");
            if (i >= 0) {
                var i1 = content.indexOf("</math", i);
                i1 = content.indexOf(">", i1) + 1;
                var equation = content.substring(i, i1);
                equation = MathMLToLaTeX.MathMLToLaTeX.convert(equation);
                content = content.substring(0, i) + "$@" + equation + "@$" + content.substring(i1);
            }
        } while (i >= 0);
        return content;
    },
    convertLaTexToInput: function (html) {
        var i = 0;
        do {
            i = html.indexOf("$@", i);
            if (i >= 0) {
                var i1 = html.indexOf("@$", i + 2);
                if (i1 > 0) {
                    const mathStart = `<math-field id='new-math-eq' style='display: inline-block;vertical-align: middle' math-virtual-keyboard-policy="auto">`;
                    const mathEnd = '</math-field>';
                    var equation = html.substring(i + 2, i1);
                    html = html.substring(0, i) + mathStart + equation + mathEnd + html.substring(i1 + 2);
                    i = i + mathStart.length + mathEnd.length + equation.length;
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        } while (true);
        return html;
    },
    convertLaTexToStandard: function (html) {
        var i = 0;
        do {
            i = html.indexOf("$", i);
            if (i >= 0) {
                var i1 = html.indexOf("$", i + 1);
                if (i1 > 0) {
                    const mathStart = `$@`;
                    const mathEnd = '@$';
                    var equation = html.substring(i + 1, i1);
                    html = html.substring(0, i) + mathStart + equation.split("\\frac").join("\\dfrac") + mathEnd + html.substring(i1 + 1);
                    i = i + mathStart.length + mathEnd.length + equation.length;
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        } while (true);
        i = 0;
        do {
            i = html.indexOf("\\(", i);
            if (i >= 0) {
                var i1 = html.indexOf("\\)", i + 2);
                if (i1 > 0) {
                    const mathStart = `$@`;
                    const mathEnd = '@$';
                    var equation = html.substring(i + 2, i1);
                    html = html.substring(0, i) + mathStart + equation.split("\\frac").join("\\dfrac") + mathEnd + html.substring(i1 + 2);
                    i = i + mathStart.length + mathEnd.length + equation.length;
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        } while (true);
        return html;
    }
};
const GraphType = { drawing: 0, point: 1, line: 2, rect: 3, circle: 4, oval: 5, image: 6, text: 7, fx: 9, spline: 10, shape: 11 };
const ShapeTypes = [
    {
        name: "Basic shapes", shapes: [
            { id: 3, icon: 'shape-3.png' },
            { id: 4, icon: 'shape-4.png' },
            { id: 5, icon: 'shape-5.png' },
            { id: 6, icon: 'shape-6.png' },
            { id: 7, icon: 'shape-7.png' },
            { id: 8, icon: 'shape-8.png' },
            { id: 10, icon: 'shape-10.png' },
            { id: 11, icon: 'shape-11.png' },
            { id: 12, icon: 'shape-12.png' },
            { id: 13, icon: 'shape-13.png' },
            { id: 14, icon: 'shape-14.png' },
            { id: 15, icon: 'shape-15.png' },
            { id: 73, icon: 'shape-73.png' },
            { id: 74, icon: 'shape-74.png' },
            { id: 96, icon: 'shape-96.png' },
            { id: 97, icon: 'shape-97.png' },
            { id: 98, icon: 'shape-98.png' }
        ]
    },
    {
        name: "Flow", shapes: [
            { id: 132, icon: 'shape-132.png' },
            { id: 133, icon: 'shape-133.png' },
            { id: 134, icon: 'shape-134.png' },
            { id: 135, icon: 'shape-135.png' },
            { id: 136, icon: 'shape-136.png' },
            { id: 137, icon: 'shape-137.png' },
            { id: 138, icon: 'shape-138.png' },
            { id: 139, icon: 'shape-139.png' },
            { id: 140, icon: 'shape-140.png' },
            { id: 141, icon: 'shape-141.png' },
            { id: 142, icon: 'shape-142.png' },
            { id: 143, icon: 'shape-143.png' },
            { id: 144, icon: 'shape-144.png' },
            { id: 145, icon: 'shape-145.png' },
            { id: 146, icon: 'shape-146.png' },
            { id: 147, icon: 'shape-147.png' },
            { id: 148, icon: 'shape-148.png' },
            { id: 149, icon: 'shape-149.png' },
            { id: 150, icon: 'shape-150.png' },
            { id: 151, icon: 'shape-151.png' },
            { id: 153, icon: 'shape-153.png' },
            { id: 154, icon: 'shape-154.png' },
            { id: 155, icon: 'shape-155.png' },
            { id: 156, icon: 'shape-156.png' },
            { id: 157, icon: 'shape-157.png' },
            { id: 158, icon: 'shape-158.png' },
            { id: 159, icon: 'shape-159.png' },
            { id: 160, icon: 'shape-160.png' }
        ]
    },
    {
        name: "Rectangles", shapes: [
            { id: 26, icon: 'shape-26.png' },
            { id: 27, icon: 'shape-27.png' },
            { id: 28, icon: 'shape-28.png' },
            { id: 29, icon: 'shape-29.png' },
            { id: 30, icon: 'shape-30.png' },
            { id: 31, icon: 'shape-31.png' },
            { id: 32, icon: 'shape-32.png' },
            { id: 33, icon: 'shape-33.png' },
            { id: 34, icon: 'shape-34.png' },
            { id: 35, icon: 'shape-35.png' },
            { id: 36, icon: 'shape-36.png' },
            { id: 37, icon: 'shape-37.png' },
            { id: 40, icon: 'shape-40.png' },
            { id: 41, icon: 'shape-41.png' },
            { id: 82, icon: 'shape-82.png' },
            { id: 83, icon: 'shape-83.png' },
            { id: 84, icon: 'shape-84.png' },
            { id: 85, icon: 'shape-85.png' },
            { id: 86, icon: 'shape-86.png' },
            { id: 87, icon: 'shape-87.png' },
            { id: 88, icon: 'shape-88.png' },
            { id: 90, icon: 'shape-90.png' },
            { id: 91, icon: 'shape-91.png' },
            { id: 92, icon: 'shape-92.png' },
            { id: 93, icon: 'shape-93.png' },
            { id: 94, icon: 'shape-94.png' },
            { id: 95, icon: 'shape-95.png' },
            { id: 131, icon: 'shape-131.png' }
        ]
    },
    {
        name: "Arrows", shapes: [
            { id: 44, icon: 'shape-44.png' },
            { id: 45, icon: 'shape-45.png' },
            { id: 46, icon: 'shape-46.png' },
            { id: 47, icon: 'shape-47.png' },
            { id: 48, icon: 'shape-48.png' },
            { id: 49, icon: 'shape-49.png' },
            { id: 50, icon: 'shape-50.png' },
            { id: 51, icon: 'shape-51.png' },
            { id: 52, icon: 'shape-52.png' },
            { id: 53, icon: 'shape-53.png' },
            { id: 54, icon: 'shape-54.png' },
            { id: 55, icon: 'shape-55.png' },
            { id: 56, icon: 'shape-56.png' },
            { id: 57, icon: 'shape-57.png' },
            { id: 58, icon: 'shape-58.png' },
            { id: 59, icon: 'shape-59.png' },
            { id: 60, icon: 'shape-60.png' },
            { id: 62, icon: 'shape-62.png' },
            { id: 63, icon: 'shape-63.png' },
            { id: 64, icon: 'shape-64.png' },
            { id: 68, icon: 'shape-68.png' },
            { id: 69, icon: 'shape-69.png' },
            { id: 70, icon: 'shape-70.png' },
            { id: 71, icon: 'shape-71.png' }
        ]
    },
    {
        name: "Others", shapes: [
            { id: 16, icon: 'shape-16.png' },
            { id: 17, icon: 'shape-17.png' },
            { id: 18, icon: 'shape-18.png' },
            { id: 19, icon: 'shape-19.png' },
            { id: 42, icon: 'shape-42.png' },
            { id: 43, icon: 'shape-43.png' },
            { id: 75, icon: 'shape-75.png' },
            { id: 76, icon: 'shape-76.png' },
            { id: 77, icon: 'shape-77.png' },
            { id: 78, icon: 'shape-78.png' },
            { id: 79, icon: 'shape-79.png' },
            { id: 80, icon: 'shape-80.png' },
            { id: 81, icon: 'shape-81.png' },
            { id: 121, icon: 'shape-121.png' }
        ]
    }
]
function Drawing(graphLineStyle = 0, lineWidth = 1) {
    this.type = GraphType.drawing;
    this.data = [];
    this.style = graphLineStyle;
    this.lineWidth = lineWidth;
    this.draw = function (ctx, centerX, centerY, axis) {
        if (this.data.length > 0) {
            if (this.style == 1) {
                ctx.setLineDash([10, 4]);
            }
            else if (this.style == 3) {
                ctx.strokeStyle = "#fff";
            }
            ctx.beginPath();
            ctx.moveTo(this.data[0], this.data[1]);
            let index = 2;
            while (index < this.data.length) {
                ctx.lineTo(this.data[index], this.data[index + 1]);
                index += 2;
            }
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
            ctx.setLineDash([0, 0]);
            ctx.strokeStyle = "#000";
        }
    }
    this.fromData = function (d) {
        this.type = d.type;
        this.data = d.data;
        this.style = d.style;
        this.lineWidth = d.line ? d.line : 1;
        return this;
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: this.data,
            style: this.style,
            line: this.lineWidth
        };
        return d;
    }
}
function SplineDrawing(graphLineStyle = 0, lineWidth = 1) {
    this.type = GraphType.spline;
    this.data = [];
    this.style = graphLineStyle;
    this.lineWidth = lineWidth;
    this.draw = function (ctx, centerX, centerY, axis) {
        if (this.data.length > 0) {
            if (this.style == 1) {
                ctx.setLineDash([10, 4]);
            }
            ctx.beginPath();
            ctx.moveTo(this.data[0], this.data[1]);
            /*let index = 2;
            while (index < this.data.length) {
                ctx.lineTo(this.data[index], this.data[index + 1]);
                index += 2;
            }*/
            curve(ctx, this.data, 0.5, 25);
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
            ctx.setLineDash([0, 0]);
        }
    }
    function curve(ctx, points, tension, numOfSeg, close) {
        if (typeof points === "undefined" || points.length < 2) return new Float32Array(0);

        // options or defaults
        tension = typeof tension === "number" ? tension : 0.5;
        numOfSeg = typeof numOfSeg === "number" ? numOfSeg : 25;

        var pts,															// for cloning point array
            i = 1,
            l = points.length,
            rPos = 0,
            rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0),
            res = new Float32Array(rLen),
            cache = new Float32Array((numOfSeg + 2) << 2),
            cachePtr = 4;

        pts = points.slice(0);

        if (close) {
            pts.unshift(points[l - 1]);										// insert end point as first point
            pts.unshift(points[l - 2]);
            pts.push(points[0], points[1]); 								// first point as last point
        }
        else {
            pts.unshift(points[1]);											// copy 1. point and insert at beginning
            pts.unshift(points[0]);
            pts.push(points[l - 2], points[l - 1]);							// duplicate end-points
        }

        // cache inner-loop calculations as they are based on t alone
        cache[0] = 1;														// 1,0,0,0

        for (; i < numOfSeg; i++) {

            var st = i / numOfSeg,
                st2 = st * st,
                st3 = st2 * st,
                st23 = st3 * 2,
                st32 = st2 * 3;

            cache[cachePtr++] = st23 - st32 + 1;							// c1
            cache[cachePtr++] = st32 - st23;								// c2
            cache[cachePtr++] = st3 - 2 * st2 + st;							// c3
            cache[cachePtr++] = st3 - st2;									// c4
        }

        cache[++cachePtr] = 1;												// 0,1,0,0

        // calc. points
        parse(pts, cache, l, tension);

        if (close) {
            pts = [];
            pts.push(points[l - 4], points[l - 3],
                points[l - 2], points[l - 1], 							// second last and last
                points[0], points[1],
                points[2], points[3]); 								// first and second
            parse(pts, cache, 4, tension);
        }

        function parse(pts, cache, l, tension) {

            for (var i = 2, t; i < l; i += 2) {

                var pt1 = pts[i],
                    pt2 = pts[i + 1],
                    pt3 = pts[i + 2],
                    pt4 = pts[i + 3],

                    t1x = (pt3 - pts[i - 2]) * tension,
                    t1y = (pt4 - pts[i - 1]) * tension,
                    t2x = (pts[i + 4] - pt1) * tension,
                    t2y = (pts[i + 5] - pt2) * tension,
                    c = 0, c1, c2, c3, c4;

                for (t = 0; t < numOfSeg; t++) {

                    c1 = cache[c++];
                    c2 = cache[c++];
                    c3 = cache[c++];
                    c4 = cache[c++];

                    res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
                    res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
                }
            }
        }

        // add last point
        l = close ? 0 : points.length - 2;
        res[rPos++] = points[l++];
        res[rPos] = points[l];

        // add lines to path
        for (i = 0, l = res.length; i < l; i += 2)
            ctx.lineTo(res[i], res[i + 1]);

        return res
    }
    this.fromData = function (d) {
        this.type = d.type;
        this.data = d.data;
        this.style = d.style;
        this.lineWidth = d.line ? d.line : 1;
        return this;
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: this.data,
            style: this.style,
            line: this.lineWidth
        };
        return d;
    }
}
function Line(x0 = 0, y0 = 0, x1 = 0, y1 = 0, arrow = 0, graphLineStyle = 0, lineWidth = 1) {
    this.type = GraphType.line;
    this.data = [x0, y0, x1, y1];
    this.arrow = arrow;
    this.style = graphLineStyle;
    this.lineWidth = lineWidth;
    this.draw = function (ctx, centerX, centerY, axis) {
        if (this.data.length > 0) {
            var v1, v2;
            ctx.lineWidth = 1;
            if (this.arrow > 0) {
                var v = {
                    x: this.data[2] - this.data[0], y: this.data[3] - this.data[1]
                };
                var d = mathUtils.distance(v, { x: 0, y: 0 });
                v.x = v.x * 10 / d;
                v.y = v.y * 10 / d;
                v1 = mathUtils.rotateVector2(v, 15);
                v2 = mathUtils.rotateVector2(v, -15);
            }
            if (this.arrow == 2) {
                ctx.beginPath();
                ctx.moveTo(this.data[0], this.data[1]);
                ctx.lineTo(this.data[0] + v1.x, this.data[1] + v1.y);
                ctx.moveTo(this.data[0], this.data[1]);
                ctx.lineTo(this.data[0] + v2.x, this.data[1] + v2.y);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(this.data[0], this.data[1]);
            if (this.style == 1) {
                ctx.setLineDash([10, 4]);
            }
            ctx.lineWidth = this.lineWidth;
            ctx.lineTo(this.data[2], this.data[3]);
            ctx.stroke();
            ctx.setLineDash([]);
            if (this.arrow > 0) {
                ctx.beginPath();
                ctx.moveTo(this.data[2], this.data[3]);
                ctx.lineTo(this.data[2] - v1.x, this.data[3] - v1.y);
                ctx.moveTo(this.data[2], this.data[3]);
                ctx.lineTo(this.data[2] - v2.x, this.data[3] - v2.y);
                ctx.stroke();
            }
        }
    }
    this.fromData = function (d) {
        this.type = d.type;
        this.data = d.data;
        this.arrow = d.arrow;
        this.style = d.style;
        this.lineWidth = d.style.line ? d.line : 1;
        return this;
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: this.data,
            arrow: this.arrow,
            style: this.style,
            line: this.lineWidth
        };
        return d;
    }
}
function Point(x = 0, y = 0) {
    this.type = GraphType.point;
    this.x = x;
    this.y = y;
    this.draw = function (ctx, centerX, centerY, axis) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1, 0, 2 * Math.PI);
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    this.fromData = function (d) {
        this.x = d.data[0];
        this.y = d.data[1];
        return this;
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: [this.x, this.y]
        };
        return d;
    }
}
function Rect(x = 0, y = 0, w = 100, h = 100, graphLineStyle = 0, lineWidth = 1) {
    this.type = GraphType.rect;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.style = graphLineStyle;
    this.lineWidth = lineWidth;
    this.draw = function (ctx, centerX, centerY, axis) {
        if (this.style == 1) {
            ctx.setLineDash([10, 4]);
        }
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
        ctx.setLineDash([]);
    }
    this.fromData = function (d) {
        this.x = d.data[0];
        this.y = d.data[1];
        this.w = d.data[2];
        this.h = d.data[3];
        this.style = d.style != null ? d.style : graphLineStyle;
        this.lineWidth = d.line != null ? d.line : 1;
        return this;
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: [this.x, this.y, this.w, this.h],
            style: this.style,
            line: this.lineWidth
        }
        return d;
    }
}
function Circle(x = 0, y = 0, r = 200, graphLineStyle = 0, lineWidth = 1) {
    this.type = GraphType.circle;
    this.x = x;
    this.y = y;
    this.r = r;
    this.style = graphLineStyle;
    this.lineWidth = lineWidth;
    this.draw = function (ctx, centerX, centerY, axis) {
        if (this.style == 1) {
            ctx.setLineDash([10, 4]);
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
        if (this.style == 1) {
            ctx.setLineDash([]);
        }
        var point = new Point(this.x, this.y);
        point.draw(ctx, centerX, centerY, axis);
    }
    this.fromData = function (d) {
        this.x = d.data[0];
        this.y = d.data[1];
        this.r = d.data[2];
        this.style = d.style != null ? d.style : graphLineStyle;
        this.lineWidth = d.line != null ? d.line : 1;
        return this;
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: [this.x, this.y, this.r],
            style: this.style,
            line: this.lineWidth
        }
        return d;
    }
}
function Oval(x = 0, y = 0, rx = 200, ry = 400, graphLineStyle = 0, lineWidth = 1) {
    this.type = GraphType.oval;
    this.x = x;
    this.y = y;
    this.rx = rx;
    this.ry = ry;
    this.style = graphLineStyle;
    this.lineWidth = lineWidth;
    this.draw = function (ctx, centerX, centerY, axis) {
        if (this.style == 1) {
            ctx.setLineDash([10, 4]);
        }
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.rx, this.ry, 0, 0, 2 * Math.PI, true);
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
        if (this.style == 1) {
            ctx.setLineDash([]);
        }
        var point = new Point(this.x, this.y);
        point.draw(ctx, centerX, centerY, axis);
    }
    this.fromData = function (d) {
        this.x = d.data[0] ? d.data[0] : 0;
        this.y = d.data[1] ? d.data[1] : 0;
        this.rx = d.data[2] ? d.data[2] : 100;
        this.ry = d.data[3] ? d.data[3] : 100;
        this.style = d.style != null ? d.style : graphLineStyle;
        this.lineWidth = d.line != null ? d.line : 1;
        return this;
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: [this.x, this.y, this.rx, this.ry],
            style: this.style,
            line: this.lineWidth
        }
        return d;
    }
}
function ImageDraw(src = "", x = 0, y = 0, w = 0, h = 0) {
    this.type = GraphType.image;
    this.x = x;
    this.y = y;
    this.src = src;
    this.w = w;
    this.h = h;
    this.draw = function (ctx, centerX, centerY, axis) {

    }
    this.fromData = function (d) {
        this.x = d.data[0] ? d.data[0] : 0;
        this.y = d.data[1] ? d.data[1] : 0;
        this.w = d.data[2] ? d.data[2] : 100;
        this.h = d.data[3] ? d.data[3] : 100;
        this.src = d.data[4] ? d.data[4] : "";
        return this;
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: [this.x, this.y, this.w, this.h, this.src]
        }
        return d;
    }
}
function GraphText(text = "", x = 0, y = 0) {
    this.type = GraphType.text;
    this.x = x;
    this.y = y;
    this.text = text;
    this.draw = function (ctx, centerX, centerY, axis) {
        ctx.textAlign = "center";
        ctx.font = "14px Verdana";
        ctx.fillText(this.text, this.x, this.y);
    }
    this.fromData = function (d) {
        this.x = d.data[0] ? d.data[0] : 0;
        this.y = d.data[1] ? d.data[1] : 0;
        this.text = d.data[2] ? d.data[2] : "";
        return this;
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: [this.x, this.y, this.text]
        }
        return d;
    }
}
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
}
function GraphFx(expression, style = 0, lineWidth = 1) {
    this.exp = expression;
    if (!window.computeEngine) {
        window.computeEngine = new ComputeEngine.ComputeEngine();
    }
    const fn = computeEngine.parse(this.exp);
    var points = [];
    this.type = GraphType.fx;
    this.style = style;
    this.lineWidth = lineWidth;
    this.calculate = function (canvas, centerX, centerY, axis) {
        var x = 40;
        points = [];
        while (x < canvas.width - 40) {
            var t = (x - centerX) / axis.X.step;
            try {
                computeEngine.set({ x: t });
                var k = fn.N();
                var y = centerY - k * axis.Y.step;
                if (y > 40 && y < canvas.height - 40) {
                    points.push({ x: x - centerX, y: y - centerY });
                }
            }
            catch (e) {
                console.log(e);
            }
            x += 1;
        }
    }
    this.draw = function (ctx, centerX, centerY, axis) {
        if (points.length == 0) {
            this.calculate(ctx.canvas, centerX, centerY, axis);
        }
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++) {
                if (points[i].x - points[i - 1].x > 2) {
                    ctx.moveTo(points[i].x, points[i].y);
                }
                else {
                    ctx.lineTo(points[i].x, points[i].y);
                }
            }
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
        }
    }
    this.toData = function () {
        var d = {
            type: this.type,
            data: this.exp,
            style: this.style,
            line: this.lineWidth
        }
        return d;
    }
}
function GraphViewer(canvas) {
    this.element = canvas;
    var ctx = canvas.getContext("2d");
    var showGrid = true;
    var axisMode = 0;
    var axis = {
        X: { center: 0, step: 48, label: 'x' },
        Y: { center: 0, step: 48, label: 'y' },
        Z: { center: 0, step: 48, label: 'z' }
    };
    var data = [];
    var dataLength = 0;
    var centerX = 0;
    var centerY = 0;
    function updateCenter() {
        centerX = 40 + (axis.X.center + 1) * (canvas.width - 80) / 2;
        centerY = 40 + (-axis.Y.center + 1) * (canvas.height - 80) / 2;
    }
    function drawGrid() {
        ctx.beginPath();
        ctx.lineWidth = 0.1;
        ctx.setLineDash([1, 1]);
        var x = canvas.width / 2;
        while (x < canvas.width) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            x += 24;
        }
        x = canvas.width / 2;
        while (x > 0) {
            x -= 24;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        x = canvas.height / 2;
        while (x < canvas.height) {
            ctx.moveTo(0, x);
            ctx.lineTo(canvas.width, x);
            x += 24;
        }
        x = canvas.height / 2;
        while (x > 0) {
            x -= 24;
            ctx.moveTo(0, x);
            ctx.lineTo(canvas.width, x);
        }
        ctx.stroke();
        ctx.strokeStyle = '#000';
        ctx.setLineDash([]);
        ctx.lineWidth = 0.8;
    }
    function drawAxis() {
        if (axisMode == 2 || axisMode == 3) {
            ctx.beginPath();
            //axis X
            ctx.moveTo(20, centerY);
            ctx.lineTo(canvas.width - 20, centerY);
            //arrow
            ctx.moveTo(canvas.width - 30, centerY + 5);
            ctx.lineTo(canvas.width - 20, centerY);
            ctx.lineTo(canvas.width - 30, centerY - 5);
            //Zero
            ctx.moveTo(centerX, centerY - 2);
            ctx.lineTo(centerX, centerY + 2);
            var x = centerX;
            //Step >0 : 1,2,3,4
            while (x < canvas.width - 32 - axis.X.step) {
                x += axis.X.step;
                ctx.moveTo(x, centerY - 2);
                ctx.lineTo(x, centerY + 2);
            }
            //Step < 0 : -1,-2,-3,-4
            x = centerX;
            while (x > 32 + axis.X.step) {
                x -= axis.X.step;
                ctx.moveTo(x, centerY - 2);
                ctx.lineTo(x, centerY + 2);
            }
            //Y AXIS
            ctx.moveTo(centerX, 20);
            ctx.lineTo(centerX, canvas.height - 20);
            ctx.moveTo(centerX - 2, centerY);
            ctx.lineTo(centerX + 2, centerY);
            //arrow
            ctx.moveTo(centerX + 5, 30);
            ctx.lineTo(centerX, 20);
            ctx.lineTo(centerX - 5, 30);
            var y = centerY;
            while (y < canvas.height - 32 - axis.Y.step) {
                y += axis.Y.step;
                ctx.moveTo(centerX - 2, y);
                ctx.lineTo(centerX + 2, y);
            }
            while (y > 32 + axis.Y.step) {
                y -= axis.Y.step;
                ctx.moveTo(centerX - 2, y);
                ctx.lineTo(centerX + 2, y);
            }
            ctx.stroke();
            ctx.font = "16px Arial";
            ctx.textAlign = "right";
            ctx.fillText(axis.X.label, canvas.width - 20, centerY + 22);
            ctx.textAlign = "center";
            ctx.fillText(axis.Y.label, centerX, 15);
        }
        if (axisMode == 3) {
            //Z AXIS
            //back
            var d = Math.min((canvas.width - centerX), (centerY)) * 0.8;
            var v = { x: d, y: 0 };
            v = mathUtils.rotateVector2(v, -60);
            ctx.beginPath();
            ctx.setLineDash([10, 4]);
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(v.x + centerX, v.y + centerY);
            ctx.stroke();
            ctx.beginPath();
            ctx.setLineDash([]);
            //arrow
            ctx.moveTo(v.x + centerX - 8, v.y + centerY + 6);
            ctx.lineTo(v.x + centerX, v.y + centerY);
            ctx.lineTo(v.x + centerX - 1, v.y + centerY + 10);
            //front
            d = Math.min((centerX), (canvas.height - centerY)) * 0.8;
            v = { x: -d, y: 0 };
            v = mathUtils.rotateVector2(v, -60);
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(v.x + centerX, v.y + centerY);
            //arrow
            //ctx.moveTo(centerX + 5, 30);
            //ctx.lineTo(centerX, 20);
            //ctx.lineTo(centerX - 5, 30);
            //var y = centerY;
            //while (y < canvas.height - 32 - axis.Y.step) {
            //    y += axis.Y.step;
            //    ctx.moveTo(centerX - 2, y);
            //    ctx.lineTo(centerX + 2, y);
            //}
            //while (y > 32 + axis.Y.step) {
            //    y -= axis.Y.step;
            //    ctx.moveTo(centerX - 2, y);
            //    ctx.lineTo(centerX + 2, y);
            //}
            ctx.stroke();
        }
    }
    function draw() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        updateCenter();
        ctx = canvas.getContext("2d");
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#000';
        if (showGrid) {
            drawGrid();
        }
        if (axisMode > 0) {
            drawAxis();
        }
        ctx.save();
        ctx.translate(centerX, centerY);
        for (var i = 0; i < dataLength; i++) {
            data[i].draw(ctx, centerX, centerY, axis);
        }
        ctx.restore();
    }
    function updateCenter() {
        centerX = 40 + (axis.X.center + 1) * (canvas.width - 80) / 2;
        centerY = 40 + (-axis.Y.center + 1) * (canvas.height - 80) / 2;
    }
    this.setContent = function (initData) {
        axis = initData && initData.axis ? initData.axis : axis;
        axisMode = initData && initData.axisMode ? initData.axisMode : axisMode;
        showGrid = initData && initData.showGrid != null ? initData.showGrid : showGrid;
        dataLength = initData && initData.dataLength != null ? initData.dataLength : 0;
        if (initData.objects) {
            data = [];
            for (var d of initData.objects) {
                if (d.type == GraphType.circle) {
                    data.push(new Circle().fromData(d));
                }
                else if (d.type == GraphType.drawing) {
                    data.push(new Drawing().fromData(d));
                }
                else if (d.type == GraphType.spline) {
                    data.push(new SplineDrawing().fromData(d));
                }
                else if (d.type == GraphType.rect) {
                    data.push(new Rect().fromData(d));
                }
                else if (d.type == GraphType.circle) {
                    data.push(new Circle().fromData(d));
                }
                else if (d.type == GraphType.oval) {
                    data.push(new Oval().fromData(d));
                }
                else if (d.type == GraphType.image) {
                    data.push(new ImageDraw().fromData(d));
                }
                else if (d.type == GraphType.text) {
                    data.push(new GraphText().fromData(d));
                }
                else if (d.type == GraphType.line) {
                    data.push(new Line().fromData(d));
                }
                else if (d.type == GraphType.fx) {
                    data.push(new GraphFx(d.data, d.style, d.line));
                }
                else if (d.type == GraphType.shape) {
                    data.push(new GraphShape(d.data));
                }
            }
        }
        updateCenter();
        draw();
    }
    setTimeout(draw, 200);
}
function renderAllGraphs(selector) {
    var parent = document;
    if (selector && typeof selector === 'string') {
        parent = document.querySelector(selector);
    }
    else if (selector) {
        parent = selector;
    }
    var allGraphs = parent.querySelectorAll("tgraph");
    for (var g of allGraphs) {
        let canvas = document.createElement("canvas");
        canvas.tabid = 0;
        canvas.className = 'editor-graph';
        let data = JSON.parse(g.innerHTML);
        if (data && data.width) {
            canvas.clientWidth = data.width;
            canvas.width = data.width;
            $(canvas).css('width', data.width);
        }
        if (data && data.height) {
            canvas.clientHeight = data.height;
            canvas.height = data.height;
            $(canvas).css('height', data.height);
        }
        g.parentNode.insertBefore(canvas, g);
        g.remove();
        let editor = new GraphViewer(canvas);
        editor.setContent(data);
    }
    renderAllSimulations(selector);
}
function renderAllSimulations(selector) {
    var parent = document;
    if (selector && typeof selector === 'string') {
        parent = document.querySelector(selector);
    }
    else if (selector) {
        parent = selector;
    }
    var allGraphs = parent.querySelectorAll("iframe.tex-simulation");
    for (var g of allGraphs) {
        let dataSrc = g.getAttribute("data-src");
        if (dataSrc) {
            g.onload = function () {
                setTimeout(function () {
                    g.style.height = g.contentWindow.document.body.scrollHeight + 'px';
                    g.style.width = g.contentWindow.document.body.scrollWidth + 'px';
                }, 50);
            }
            var htmlString = decodeURIComponent(dataSrc);
            var blob = new Blob([htmlString], { type: "text/html" });
            var url = URL.createObjectURL(blob);
            g.src = url;
        }
    }
}
function TextEditor(item, opts) {
    const options = opts;
    var changeHandler = -1;
    var changeCountDown = 10;
    var thisTextEditor = this;
    var stacks = [];
    const callInitCallBack = [];
    if (window.needNewTool == null) {
        window.selectionEditor = null;
        window.needNewTool = false;
        window.contextTool = null;
        document.addEventListener("mousedown", function (e) {
            if (window.contextTool == null || window.contextTool.length == 0 || !isClickOnEditorOrTool(e)) {
                selectionEditor = null;
            }
        });
        document.addEventListener("mouseup", function (e) {
            if (window.contextTool != null && window.contextTool.length > 0) {
                if (!isClickOnEditorOrTool(e)) {
                    if (window.contextTool != null) {
                        needNewTool = true;
                        window.contextTool.remove();
                        window.contextTool = null;
                    }
                }
                else if (selectionEditor == null) {
                    needNewTool = true;
                    window.contextTool.remove();
                    window.contextTool = null;
                }
            }
        });
    }
    function isClickOnEditorOrTool(e) {
        return (window.contextTool != null && window.contextTool.length > 0 && window.contextTool[0].contains(e.target)) || (selectionEditor != null && (selectionEditor.element.contains(e.target) || (selectionEditor.element.tagName == "CANVAS" && selectionEditor.element.parentElement.contains(e.target))));
    }
    function raiseChangeEvent(countDown = -1, pushStack = true) {
        var content = getContent();
        if (pushStack && (stacks.length == 0 || stacks[stacks.length - 1] != content)) {
            currentStackIndex = stacks.length - 1;
            stacks.push(content);
        }
        if (opts.onchange) {
            if (opts.changeWaitTime != null) {
                countDown = opts.changeWaitTime;
            }
            else if (countDown < 0) {
                countDown = 10;
            }
            if (countDown == 0) {
                opts.onchange(thisTextEditor, item);
            }
            else {
                changeCountDown = countDown;
                if (changeHandler < 0) {
                    changeHandler = setInterval(function () {
                        changeCountDown--;
                        if (changeCountDown <= 0) {
                            clearInterval(changeHandler);
                            changeHandler = -1;
                            opts.onchange(thisTextEditor, item);
                        }
                    }, 200);
                }
            }
        }
    }
    this.getContent = getContent;
    function getContent() {
        var html = item.innerHTML;
        var allGraphs = item.querySelectorAll("canvas.editor-graph");
        var index = 0;
        var count = 0;
        do {
            index = html.indexOf("<canvas", index);
            if (index >= 0) {
                var i1 = html.indexOf(">", index);
                if (i1 > index) {
                    if (html.substring(index, i1).includes("editor-graph")) {
                        i1 = html.indexOf("</canvas", i1);
                        i1 = html.indexOf(">", i1) + 1;
                        var data = allGraphs[count].editor.getContent();
                        while (true) {
                            var i2 = html.lastIndexOf("<", index - 1);
                            if (i2 >= 0 && html.substring(i2, index).includes("ui-wrapper")) {
                                index = i2;
                                i1 = html.indexOf("</", i1);
                                i1 = html.indexOf(">", i1) + 1;
                            }
                            else {
                                break;
                            }
                        }
                        html = (index > 0 ? html.substring(0, index) : "") + "<tgraph>" + JSON.stringify(data) + "</tgraph>" + (i1 < html.length ? html.substring(i1) : "");
                        count++;
                    }
                    index = i1;
                }
                else {
                    index++;
                }
            }
            else {
                break;
            }
        }
        while (true);
        //math field
        allGraphs = item.querySelectorAll("math-field");
        index = 0;
        count = 0;
        do {
            index = html.indexOf("<math-field");
            if (index >= 0) {
                var i0 = index;
                index = html.indexOf(">", index);
                i1 = html.indexOf("</math-field", index);
                i1 = html.indexOf(">", i1) + 1;
                var data = allGraphs[count].value;
                html = html.substring(0, i0) + "$@" + data.split("\\frac").join("\\dfrac") + "@$" + html.substring(i1);
                count++;
            }
            else {
                break;
            }
        }
        while (true);
        //ui resize handler
        index = 0;
        do {
            index = html.indexOf("ui-resizable-handle", index);
            if (index >= 0) {
                var i1 = html.lastIndexOf("<", index);
                if (i1 >= 0) {
                    var i2 = html.indexOf(" ", i1 + 1, index);
                    if (i2 > 0) {
                        var tag = html.substring(i1 + 1, i2);
                        if (tag.toLowerCase() == "div") {
                            index = html.indexOf(">", index);
                            index = html.indexOf("<", index);
                            index = html.indexOf(">", index);
                            html = (i1 > 0 ? html.substring(0, i1) : "") + html.substring(index + 1);
                            index = i1;
                        }
                    }
                    else {
                        index++;
                    }
                }
                else {
                    index++;
                }
            }
            else {
                break;
            }
        } while (true);
        return html;
    }
    this.setContent = setContent;
    function setContent(html) {
        item.innerHTML = html;
        stacks = [];
        currentStackIndex = 0;
        for (var caller of callInitCallBack) {
            caller();
        }
    }
    function renderEditor(elm) {
        const editor_tool_bar = `<button type='button' class='btn btn-sm border btn-new' title='${options.titleDelete}'><i class="fas fa-backspace"></i></button>`;
        elm.contentEditable = true;
        elm.spellcheck = false;
        var holder = document.createElement("div");
        holder.className = "text-editor-holder";
        elm.parentNode.insertBefore(holder, elm);
        var tool = document.createElement("div");
        tool.className = "editor-tool";
        tool.innerHTML = editor_tool_bar;
        holder.appendChild(tool);
        holder.appendChild(elm);
        /*elm.addEventListener("mousedown",function () {
            selectionEditor = null;
        });*/
        tool.querySelector(".btn-new").onclick = function () {
            //document.execCommand('delete', false, '');
            elm.innerHTML = "<div></div>";
        };
        textPlugin(elm, tool);
        tablePlugin(elm, tool);
        mathPlugin(elm, tool);
        graphPlugin(elm, tool);
        if (options.image) {
            imagePlugin(elm, tool);
        }
        if (options.video) {
            youtubePlugin(elm, tool);
            videoPlugin(elm, tool);
        }
        if (options.audio) {
            audioPlugin(elm, tool);
        }
        if (options.html) {
            htmlPlugin(elm, tool);
        }
        if (options.ai) {
            aiPlugin(elm, tool);
        }
        attachmentPlugin(elm, tool);
        for (var fn of callInitCallBack) {
            fn();
        }
    }
    function attachmentPlugin(elm, tool) {
        var file = elm.getAttribute("data-file");
        var qr = elm.getAttribute("data-qr");
        if (qr == "1" || file == "1") {
            var spacer = document.createElement("div");
            spacer.className = 'editor-tool-spacer';
            tool.appendChild(spacer);
            if (qr == "1") {
                var btn = document.createElement("button");
                btn.type = 'button';
                btn.className = "btn btn-sm border btn-qrcode";
                btn.innerHTML = '<i class="fa fa-qrcode"></i>&nbsp;' + options.titleScanQRCode;
                btn.onclick = function () {
                    if (options.onRequestQrCode) {
                        options.onRequestQrCode(thisTextEditor, elm);
                    }
                }
                tool.appendChild(btn);
            }
            if (file == "1") {
                var btn = document.createElement("button");
                btn.type = 'button';
                btn.className = "btn btn-sm border btn-qrcode";
                btn.innerHTML = '<i class="fas fa-paperclip"></i>&nbsp;' + options.titleSelectFile;
                btn.onclick = function () {
                    restoreSelection();
                    if (options.onRequestAttachFile) {
                        options.onRequestAttachFile(thisTextEditor, elm);
                    }
                }
                tool.appendChild(btn);
            }
        }
    }
    this.insertHtml = function (html) {
        insertHtmlContent(html);
        if (options.onchange != null) {
            raiseChangeEvent();
        }
    }
    this.ensureViewVisible = function (offsetBottom = 0) {
        var parent = item.parentElement.parentElement;
        while (parent != null) {
            if (parent.scrollHeight - 10 > $(parent).height()) {
                break;
            }
            parent = parent.parentElement;
        }
        var parentRect = parent.getBoundingClientRect();
        const elementRect = item.getBoundingClientRect();
        parentRect = new DOMRect(parentRect.left, parentRect.top, parentRect.width, parentRect.height - offsetBottom);
        var isVisible = (elementRect.top >= parentRect.top
            && elementRect.bottom <= parentRect.bottom
            && elementRect.left >= parentRect.left
            && elementRect.right <= parentRect.right);
        if (!isVisible) {
            parent.scrollTop += elementRect.bottom - parentRect.bottom + 10;
        }
    }
    function isSelectInside() {
        var sel = window.getSelection();
        if (sel.rangeCount > 0) {
            for (var i = 0; i < sel.rangeCount; ++i) {
                if (!item.contains(sel.getRangeAt(i).commonAncestorContainer)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    function insertHtmlContent(html) {
        if (!isSelectInside()) return;
        const sel = window.getSelection();
        if (sel.rangeCount) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const frag = document.createDocumentFragment();
            let node, lastNode;
            let array = [];
            while ((node = tempDiv.firstChild)) {
                lastNode = frag.appendChild(node);
                array.push(lastNode);
            }
            range.insertNode(frag);
            if (lastNode) {
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            for (var fn of callInitCallBack) {
                fn();
            }
            return array;
        }
    }
    function getSelectionElements() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const selectedElements = [];

        if (selection.rangeCount > 0) {
            const startContainer = range.startContainer;
            const endContainer = range.endContainer;

            if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
                const span = document.createElement('span');
                span.appendChild(range.extractContents());
                range.insertNode(span);
                selectedElements.push(span);
            } else {
                const treeWalker = document.createTreeWalker(
                    range.commonAncestorContainer,
                    NodeFilter.SHOW_ELEMENT,
                    {
                        acceptNode: function (node) {
                            return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                        }
                    }
                );

                while (treeWalker.nextNode()) {
                    const node = treeWalker.currentNode;
                    if (node.nodeType === Node.TEXT_NODE && range.intersectsNode(node)) {
                        const span = document.createElement('span');
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                        selectedElements.push(span);
                    } else {
                        selectedElements.push(node);
                    }
                }
            }
        }

        console.log('Selected elements:', selectedElements);
        return selectedElements;
        /*
        var listSelection = [];
        var sel = document.getSelection();
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0);
            var contents = [];
            function getContentRescusive(start, end, contents, canup = true) {
                if (!start.children || start.children.length == 0) {
                    contents.push(start);
                }
                if (start.childNodes) {
                    for (var el of start.childNodes) {
                        if (el.nodeType == Node.TEXT_NODE) {
                            contents.push(el);
                        }
                        else {
                            if (getContentRescusive(el, end, contents, false)) {
                                return true;
                            }
                        }
                    }
                }
                if (start == end) {
                    return true;
                }
                while (start.nextSibling) {
                    start = start.nextSibling;
                    if (getContentRescusive(start, end, contents, false)) {
                        return true;
                    }
                }
                if (!canup) return false;
                start = start.parentNode;
                if (!start) return false;
                if (start.nextSibling) {
                    if (getContentRescusive(start.nextSibling, end, contents, true)) {
                        return true;
                    }
                }
                return false;
            }
            var start = range.startOffset;
            var end = range.endOffset;
            getContentRescusive(range.startContainer, range.endContainer, contents, true);
            if (contents.length > 0) {
                for (var i = 0; i < contents.length; i++) {
                    let el = contents[i];
                    if (el.nodeType == Node.TEXT_NODE) {
                        var span = document.createElement("span");
                        listSelection.push(span);
                        if (i == 0) {
                            range.selectNode(el);
                            range.setStart(el, start);
                            if (contents.length == 1) {
                                if (end > el.length) {
                                    end = el.length;
                                }
                                range.setEnd(el, end);
                            }
                        }
                        else if (i == contents.length - 1) {
                            range.selectNode(el);
                            if (end > el.length) {
                                end = el.length;
                            }
                            range.setEnd(el, end);
                        }
                        else {
                            range.selectNode(el);
                        }
                        var html = "";
                        var frag = range.extractContents();
                        for (var selm of frag.childNodes) {
                            html += selm.textContent;
                        }
                        span.textContent = html;
                        range.insertNode(span);
                        while (true) {
                            var p = span.parentElement;
                            if (p == null) break;
                            var b = false;
                            for (var n of p.childNodes) {
                                if (n != span && (n.nodeType != Node.TEXT_NODE || n.textContent.length > 0)) {
                                    b = true;
                                    break;
                                }
                            }
                            if (b) {
                                break;
                            }
                            if (p.tagName == "SPAN") {
                                p.parentElement.insertBefore(span, p);
                                p.remove();
                            }
                            else {
                                break;
                            }
                        }
                    }
                    else {
                        listSelection.push(el);
                    }
                }
            }
        }
        return listSelection;*/
    }
    function getBodyHtml(html) {
        var i = html.indexOf("<body");
        if (i > 0) {
            i = html.indexOf(">", i);
            html = html.substring(i + 1);
        }
        i = html.indexOf("</body");
        if (i > 0) {
            html = html.substring(0, i);
        }
        i = html.indexOf("<!--StartFragment-->");
        if (i > 0) {
            i = html.indexOf(">", i);
            html = html.substring(i + 1);
        }
        i = html.indexOf("<!--EndFragment-->");
        if (i > 0) {
            html = html.substring(0, i);
        }
        return html;
    }
    function textPlugin(elm, tool) {
        $(tool).append(`<span><select class='form-select font-select' style='width:100px'>
</select></span><button type='button' class='btn btn-sm btn-bold border' title='${options.titleBold}'><i class="fas fa-bold"></i></i></button>
<button type='button' class='btn btn-sm btn-italic border' title='${options.titleItalic}'><i class="fas fa-italic"></i></button>
<button type='button' class='btn btn-sm btn-align border' data-align="center" title='${options.titleAlignCenter}'><i class="fas fa-align-center"></i></button>
<button type='button' class='btn btn-sm btn-align border' data-align="left" title='${options.titleAlignLeft}'><i class="fas fa-align-left"></i></button>
<button type='button' class='btn btn-sm btn-align border' data-align="right" title='${options.titleAlignRight}'><i class="fas fa-align-right"></i></button>
<button type='button' class='btn btn-sm btn-align border' data-align="justify" title='${options.titleAlignJustify}'><i class="fas fa-align-justify"></i></button>
<button type='button' class='btn btn-sm btn-clear-format border' title='${options.titleClearFormat}'><i class="fas fa-eraser"></i></button>
<button type="button" class='btn btn-sm border btn-undo' title='` + options.titleUndo + `'><i class="fas fa-undo"></i></button>
<button type="button" class='btn btn-sm border btn-redo' title='` + options.titleRedo + `'><i class="fas fa-redo"></i></button>
`);
        var font = $(tool).find(".font-select");
        var fontOpts = "";
        for (var i = 5; i <= 100; i++) {
            fontOpts += "<option value='" + i + "px'>" + i + "px</option>";
        }
        font.html(fontOpts);
        font.on("change", function () {
            var elms = getSelectionElements();
            for (var el of elms) {
                el.style.fontSize = this.value;
            }
            if (options.onchange != null) {
                raiseChangeEvent(1);
            }
        });
        font.val("15px");
        elm.onclick = function (e) {
            //restoreSelection();
            if (!this.innerHTML) {
                this.innerHTML = "<div style='font-size:" + font.val() + "'>&nbsp;</div>";
                this.children[0].focus();
            }
            else {
                if (this.children.length == 0 && !this.innerHTML) {
                    var div = document.createElement("div");
                    div.innerHTML = "&nbsp;";
                    div.style.fontSize = font.val();
                    this.appendChild(div);
                }
                setTimeout(function () {
                    var sel = document.getSelection();
                    if (sel.rangeCount > 0) {
                        var range = sel.getRangeAt(0);
                        var node = range.endContainer;
                        while (node.nodeType == Node.TEXT_NODE) {
                            node = node.parentElement;
                        }
                        var style = window.getComputedStyle(node, null).getPropertyValue('font-size');
                        var size = Math.round(parseFloat(style));
                        font.val(size + "px");
                    }
                }, 100);
            }
        };
        elm.addEventListener("input", function () {
            //var handlers = $(elm).find(".ui-wrapper");
            //for (var i = 0; i < handlers.length; i++) {
            //    if (handlers[i].children.length == 0 || handlers[i].children[0].children.length == 0) {
            //        $(handlers[i]).remove();
            //    }
            //}
            if (elm.children.length == 0) {
                elm.innerHTML = "<div style='font-size:" + font.val() + "'>&nbsp;</div>";
            }
            if (options.onchange != null) {
                raiseChangeEvent(1);
            }
        });
        elm.onpaste = (e) => {
            let cbPayload = [...(e.clipboardData || e.originalEvent.clipboardData).items];
            let images = cbPayload.filter(i => /image/.test(i.type));
            if (images.length > 0) {
                //paste image
                let reader = new FileReader();
                reader.onload = (e) => {
                    var img = document.createElement("img");
                    img.onload = function () {
                        var maxImageSize = options.maxImageSize ? options.maxImageSize : 600;
                        if (img.width > maxImageSize) {
                            var canvas = document.createElement("canvas");
                            canvas.width = maxImageSize;
                            canvas.height = Math.round(img.height * maxImageSize / img.width);
                            var context = canvas.getContext("2d");
                            var scale = maxImageSize / img.width;
                            context.save();
                            context.translate(canvas.width / 2, canvas.height / 2);
                            context.scale(scale, scale);
                            context.drawImage(img, -img.width / 2, -img.height / 2);
                            context.restore();
                            var nodes = insertHtmlContent(`<img style='min-width:20px;min-height:20px;display:inline;width:${canvas.width};height:${canvas.height}' src="${canvas.toDataURL("image/png", "100")}"/>`);
                            //setTimeout(function () {
                            //    $(nodes[0]).resizable({
                            //        resize: function () {
                            //            raiseChangeEvent();
                            //        }
                            //    });
                            //}, 1000);
                        }
                        else {
                            var nodes = insertHtmlContent(`<img style='min-width:20px;min-height:20px;display:inline;width:${img.width};height:${img.height}' src="${e.target.result}"/>`);
                            //setTimeout(function () {
                            //    $(nodes[0]).resizable({
                            //        resize: function () {
                            //            raiseChangeEvent();
                            //        }
                            //    });
                            //}, 1000);
                        }
                    }
                    img.src = e.target.result;
                }
                reader.readAsDataURL(images[0].getAsFile());
                e.preventDefault();
                return false;
            }
            else {
                var htmls = cbPayload.filter(i => /html/.test(i.type));
                if (htmls.length > 0) {
                    htmls[0].getAsString((st) => {
                        st = getBodyHtml(st);
                        insertHtmlContent(st);
                        createGraphEditors(elm);
                    });
                    return false;
                }
                var texts = cbPayload.filter(i => /text/.test(i.type));
                if (texts.length > 0) {
                    texts[0].getAsString((st) => {
                        st = getBodyHtml(st);
                        insertHtmlContent(st);
                        createGraphEditors(elm);
                    });
                    return false;
                }
            }
        }
        elm.oncopy = (e) => {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const container = document.createElement('div');
            container.appendChild(range.cloneContents());
            // Tìm tất cả các phần tử canvas trong nội dung sao chép 
            const canvases = container.getElementsByTagName('canvas');
            for (let i = 0; i < canvases.length; i++) {
                const canvas = canvases[i];
                const text = canvas.getAttribute("data-graphs");
                // Thay thế canvas bằng img 
                var node = document.createElement("tgraph");
                node.innerHTML = text;
                canvas.parentNode.replaceChild(node, canvas);
            }
            e.preventDefault();
            navigator.clipboard.write([
                new ClipboardItem({
                    'text/plain': new Blob([container.innerText], { type: 'text/plain' }),
                    'text/html': new Blob([container.innerHTML], { type: 'text/html' })
                })
            ]);
        }
        $(tool).find(".btn-align").on('click', function () {
            restoreSelection();
            var elms = getSelectionElements();
            var align = $(this).data("align");
            for (var el of elms) {
                el.style.textAlign = align;
                if (el.tagName == "SPAN") {
                    el.parentNode.style.textAlign = align;
                }
            }
            restoreSelection();
            elm.focus();
            if (options.onchange != null) {
                raiseChangeEvent(1);
            }
        });
        $(tool).find(".btn-bold").on('click', function () {
            restoreSelection();
            //document.execCommand('bold', false, null);
            var elms = getSelectionElements();
            for (var el of elms) {
                if (el.style.fontWeight == "bold") {
                    el.style.fontWeight = "normal";
                }
                else {
                    el.style.fontWeight = "bold";
                }
            }
            if (options.onchange != null) {
                raiseChangeEvent(1);
            }
        });
        $(tool).find(".btn-italic").on('click', function () {
            restoreSelection();
            //document.execCommand('italic', false, null);
            var elms = getSelectionElements();
            for (var el of elms) {
                if (el.style.fontStyle == "italic") {
                    el.style.fontStyle = "normal";
                }
                else {
                    el.style.fontStyle = "italic";
                }
            }
            if (options.onchange != null) {
                raiseChangeEvent(1);
            }
        });
        $(tool).find(".btn-clear-format").on('click', function () {
            restoreSelection();
            var elms = getSelectionElements();
            for (var el of elms) {
                el.style = "normal";
            }
            if (options.onchange != null) {
                raiseChangeEvent(1);
            }
        });
        $(tool).find(".btn-undo").on('click', function () {
            saveSelection();
            undo();
        });
        $(tool).find(".btn-redo").on('click', function () {
            saveSelection();
            redo();
        });
    }
    function GraphEditor(cv) {
        var canvas = cv;
        this.element = canvas;
        if (window.graph_editor_id == null) {
            window.graph_editor_id = 1;
        }
        canvas.id = "graph-" + (window.graph_editor_id++);
        canvas.editor = this;
        var ctx = canvas.getContext("2d");
        var drawBuffer;
        var editorMode = 'pointer';
        var editingItem = null;
        var showGrid = true;
        var axisMode = 0;
        var axis = {
            X: { center: 0, step: 48, label: 'x' },
            Y: { center: 0, step: 48, label: 'y' },
            Z: { center: 0, step: 48, label: 'z' }
        };
        var mousePos;
        var currentMousePos;
        var data = [];
        var dataLength = 0;
        var centerX = 0;
        var centerY = 0;
        var graphLineStyle = 0;
        var lineWidth = 1;
        var isCircleCenter = false;
        var eraserWidth = 20;
        var timeStand = 0;
        var timerHandler = -1;
        var shapeType = 138;
        var textInput = null;
        function updateCenter() {
            centerX = 40 + (axis.X.center + 1) * (canvas.width - 80) / 2;
            centerY = 40 + (-axis.Y.center + 1) * (canvas.height - 80) / 2;
        }
        function recalculateFunctions() {
            for (var ditem of data) {
                if (ditem.type == GraphType.fx) {
                    ditem.calculate(canvas, centerX, centerY, axis);
                }
            }
        }
        function setupInputLabel(e, pos) {
            var textPosition = canvas.getBoundingClientRect();
            if ($(canvas).parent().hasClass("ui-wrapper")) {
                textPosition = { left: 0, top: 0 };
            }
            if (textInput != null) {
                //textInput.remove();
                //  textInput = null;
            }
            else {
                textInput = document.createElement("input");
            }
            textInput.value = "";
            textInput.style.position = 'absolute';
            textInput.style.top = (e.offsetY + textPosition.top - 10) + 'px';
            textInput.style.left = (e.offsetX + textPosition.left) + 'px';
            textInput.style.width = 80;
            textInput.style.border = "solid 1px #888888";
            canvas.parentElement.appendChild(textInput);
            textInput.addEventListener('keydown', function (e) {
                // hide on enter
                if (e.key.toLocaleLowerCase() == "enter") {
                    if (this.value) {
                        var text = new GraphText(this.value, pos.x, pos.y, graphLineStyle);
                        addObject(text);
                        draw();
                        this.remove();
                        textInput = null;
                        canvas.focus();
                        selectionEditor = canvas.editor;
                        showTool(canvas);
                    }
                }
                else if (e.key.toLocaleLowerCase() == "escape") {
                    this.value = "";
                    this.blur();
                }
            });
            textInput.focus();
            textInput.onblur = function () {
                textInput.remove();
                textInput = null;
            };
            e.preventDefault();
        }
        function initCanvas() {
            var isMouseDown = false;
            mousePos = { x: 0, y: 0 };
            //$(canvas).resizable({
            //    resize: function (event, ui) {
            //        draw();
            //    },
            //    stop: function (event, ui) {
            //        recalculateFunctions();
            //        canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
            //        raiseChangeEvent();
            //        draw();
            //    }
            //});
            canvas.onSizeChanged = function () {
                draw();
            };
            canvas.addEventListener("keydown", function (e) {
                if (e.key == "Escape") {
                    editingItem = null;
                    isMouseDown = false;
                    if (textInput != null) {
                        textInput.value = "";
                    }
                    e.preventDefault();
                    draw();
                }
                else if ((e.key == "z" || e.key == "Z") && e.ctrlKey) {
                    if (dataLength > 0) {
                        dataLength--;
                        canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                        raiseChangeEvent()
                        draw();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
                else if ((e.key == "y" || e.key == "Y") && e.ctrlKey) {
                    if (dataLength < data.length - 1) {
                        dataLength++;
                        canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                        raiseChangeEvent()
                        draw();
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
            });
            canvas.addEventListener("click", function (e) {
                needNewTool = false;
                if (selectionEditor == null || selectionEditor.element != canvas) {
                    needNewTool = true;
                }
                selectionEditor = canvas.editor;
                selectionEditor.element = canvas;
                showTool(canvas);
                e.stopPropagation();
            });
            canvas.addEventListener("mousedown", function (e) {
                selectionEditor = canvas.editor;
                if (textInput != null) {
                    textInput.remove();
                    textInput = null;
                }
                this.focus();
                currentMousePos = getCursorPosition(canvas, e);
                if (e.which == 1) {
                    isMouseDown = true;
                    timeLastMove = Date.now();
                    var pos = currentMousePos;
                    if (editorMode == 'circle') {
                        mousePos = pos;
                    }
                    else if (editorMode == 'oval') {
                        mousePos = pos;
                    }
                    else if (editorMode == 'rect') {
                        mousePos = pos;
                    }
                    else if (editorMode == 'pen' || editorMode == 'eraser') {
                        editingItem = new Drawing(editorMode == 'eraser' ? 3 : graphLineStyle, editorMode == 'eraser' ? eraserWidth : lineWidth);
                        editingItem.data.push(pos.x);
                        editingItem.data.push(pos.y);
                        timeStand = 0;
                        if (editorMode == 'pen') {
                            timerHandler = setInterval(function () {
                                if (editingItem == null) {
                                    clearInterval(timerHandler);
                                    timerHandler = -1;
                                    return;
                                }
                                timeStand++;
                                if (timeStand > 15) {
                                    if (editingItem.data.length > 4) {
                                        editingItem.data = simplify(editingItem.data, 5, true);
                                        var curve = new SplineDrawing(editingItem.style, editingItem.lineWidth);
                                        curve.data = editingItem.data;
                                        addObject(curve);
                                        editingItem = new Drawing(curve.style, curve.lineWidth);
                                        draw();
                                    }
                                }
                            }, 100);
                        }
                    }
                    else if (editorMode == 'line') {
                        editingItem = new Line(pos.x, pos.y, pos.x, pos.y, 0, graphLineStyle, lineWidth);
                        draw();
                    }
                    else if (editorMode == 'line-oa') {
                        editingItem = new Line(pos.x, pos.y, pos.x, pos.y, 1, graphLineStyle, lineWidth);
                        draw();
                    }
                    else if (editorMode == 'line-ta') {
                        editingItem = new Line(pos.x, pos.y, pos.x, pos.y, 2, graphLineStyle, lineWidth);
                        draw();
                    }
                    else if (editorMode == 'text') {
                        mousePos = pos;
                        /*swal("Nội dung:", {
                            content: "input",
                        })
                        .then((value) => {
                            if (value) {
                                var text = new GraphText(value, pos.x, pos.y, graphLineStyle);
                                addObject(text);
                                draw();
                            }
                            canvas.focus();
                            selectionEditor = canvas.editor;
                            showTool(canvas)
                        });*/
                        setupInputLabel(e, pos);
                    }
                    else if (editorMode == 'shape') {
                        var adjust1 = 25000;
                        var adjust2 = 0;
                        var adjust3 = 0;
                        var adjust4 = 0;
                        var adjust5 = 0;
                        if (shapeType == 33) {
                            adjust2 = 25000;
                            adjust1 = 0;
                        }
                        else if (shapeType == 40) {
                            adjust2 = 270;
                            adjust1 = 0;
                        }
                        else if (shapeType == 41) {
                            adjust1 = -90;
                            adjust2 = 0;
                        }
                        else if (shapeType == 42) {
                            adjust1 = 18000;
                        }
                        else if (shapeType == 43) {
                            adjust1 = 18000;
                        }
                        else if (shapeType >= 44 && shapeType <= 49) {
                            adjust1 = 50000;
                            adjust2 = 50000;
                        }
                        else if (shapeType == 50 || shapeType == 53 || shapeType == 54) {
                            adjust1 = 25000;
                            adjust2 = 25000;
                            adjust3 = 25000;
                        }
                        else if (shapeType == 51 || shapeType == 52) {
                            adjust1 = 50000;
                            adjust2 = 50000;
                        }
                        else if (shapeType == 55) {
                            adjust1 = 15000;
                            adjust2 = 15000;
                            adjust3 = 15000;
                        }
                        else if (shapeType == 56 || shapeType == 57 || shapeType == 58 || shapeType == 59) {
                            adjust1 = 15000;
                            adjust2 = 15000;
                            adjust3 = 20000;
                            adjust4 = 60000;
                        }
                        else if (shapeType == 60) {
                            adjust1 = 15000;
                            adjust2 = 15000;
                            adjust3 = 20000;
                            adjust4 = 60000;
                        }
                        else if (shapeType == 61) {
                            adjust1 = 15000;
                            adjust2 = 15000;
                            adjust3 = 20000;
                            adjust4 = 60000;
                        }
                        else if (shapeType == 62) {
                            adjust1 = 15000;
                            adjust2 = 15000;
                            adjust3 = 20000;
                            adjust4 = 50000;
                        }
                        else if (shapeType == 63) {
                            adjust1 = 15000;
                            adjust2 = 15000;
                            adjust3 = 20000;
                            adjust4 = 50000;
                        }
                        else if (shapeType == 64) {
                            adjust1 = 15000;
                            adjust2 = 15000;
                            adjust3 = 20000;
                            adjust4 = 50000;
                            adjust5 = 50000;
                        }
                        else if (shapeType == 65 || shapeType == 66) {
                            adjust1 = 10000;//think
                            adjust2 = 26;//
                            adjust3 = 65;//end
                            adjust4 = 270; //start
                            adjust5 = 25000; //arrow
                        }
                        else if (shapeType == 67 || shapeType == 68 || shapeType == 69 || shapeType == 70 || shapeType == 71) {
                            adjust1 = 20000;//think
                            adjust2 = 20000;//
                            adjust3 = 20000;//end
                        }
                        else if (shapeType == 82) {
                            adjust1 = 30000;
                        }
                        else if (shapeType == 85) {
                            adjust1 = 25000;
                            adjust2 = 25000;
                        }
                        else if (shapeType == 86) {
                            adjust1 = 40000;
                            adjust2 = 40000;
                        }
                        else if (shapeType == 87) {
                            adjust1 = 50000;
                        }
                        else if (shapeType == 88) {
                            adjust1 = 45;
                            adjust2 = 270;
                        }
                        else if (shapeType == 91 || shapeType == 92) {
                            adjust1 = 30000;
                            adjust2 = 50000;
                        }
                        else if (shapeType == 96) {
                            adjust1 = 35000;
                            adjust2 = 25000;
                            adjust3 = 50000;
                        }
                        else if (shapeType == 97) {
                            adjust1 = 35000;
                            adjust2 = 25000;
                            adjust3 = 50000;
                        }
                        var data = [pos.x, pos.y, pos.x, pos.y, lineWidth, shapeType, 0, 0, 0, adjust1, adjust2];
                        if (adjust3 != 0) {
                            data.push(adjust3);
                        }
                        if (adjust4 != 0) {
                            data.push(adjust4);
                        }
                        if (adjust5 != 0) {
                            data.push(adjust5);
                        }
                        editingItem = new GraphShape(data);
                        draw();
                    }
                }
            });
            canvas.addEventListener("mousemove", function (e) {
                currentMousePos = getCursorPosition(canvas, e);
                var pos = currentMousePos;
                if (e.which == 1) {
                    if (isMouseDown) {
                        if (editorMode == 'circle') {
                            editingItem = buildCircle(mousePos, pos, isCircleCenter);
                            draw();
                        }
                        else if (editorMode == 'oval') {
                            editingItem = buildOval(mousePos, pos);
                            draw();
                        }
                        else if (editorMode == 'rect') {
                            editingItem = buildRect(mousePos, pos);
                            draw();
                        }
                        else if (editorMode == 'pen' || editorMode == 'eraser') {
                            timeStand = 0;
                            editingItem.data.push(pos.x);
                            editingItem.data.push(pos.y);
                            draw();
                        }
                        else if (editorMode == 'line' || editorMode == 'line-oa' || editorMode == 'line-ta') {
                            if (e.shiftKey) {
                                var dx = Math.abs(pos.x - editingItem.data[0]);
                                var dy = Math.abs(pos.y - editingItem.data[1]);
                                if (dx > dy) {
                                    editingItem.data[editingItem.data.length - 2] = pos.x;
                                    editingItem.data[editingItem.data.length - 1] = editingItem.data[1];
                                }
                                else {
                                    editingItem.data[editingItem.data.length - 2] = editingItem.data[0];
                                    editingItem.data[editingItem.data.length - 1] = pos.y;
                                }
                            }
                            else {
                                editingItem.data[editingItem.data.length - 2] = pos.x;
                                editingItem.data[editingItem.data.length - 1] = pos.y;
                            }
                            draw();
                        }
                        else if (editorMode == 'shape') {
                            editingItem.data[2] = pos.x;
                            editingItem.data[3] = pos.y;
                            draw();
                        }
                    }
                }
                if (editorMode == 'polygon' && editingItem != null) {
                    editingItem.data[editingItem.data.length - 2] = pos.x;
                    editingItem.data[editingItem.data.length - 1] = pos.y;
                    draw();
                }
                if (editorMode == 'eraser') {
                    ctx.putImageData(drawBuffer, 0, 0);
                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.fillStyle = "#ff000044";
                    ctx.beginPath();
                    ctx.arc(currentMousePos.x, currentMousePos.y, eraserWidth / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.restore();
                }
            });
            canvas.addEventListener("mouseup", function (e) {
                currentMousePos = getCursorPosition(canvas, e);
                if (e.which == 1) {
                    if (editorMode == 'polygon') {
                        var pos = currentMousePos;
                        if (editingItem == null) {
                            if (editingItem == null) {
                                editingItem = new Drawing(graphLineStyle, lineWidth);
                                editingItem.data.push(pos.x);
                                editingItem.data.push(pos.y);
                            }
                            editingItem.data.push(pos.x);
                            editingItem.data.push(pos.y);
                        }
                        else {
                            editingItem.data.push(pos.x);
                            editingItem.data.push(pos.y);
                            var d = mathUtils.distance({ x: editingItem.data[0], y: editingItem.data[1] }, pos);
                            if (d <= 10) {
                                editingItem.data[editingItem.data.length - 2] = editingItem.data[0];
                                editingItem.data[editingItem.data.length - 1] = editingItem.data[1];
                                addObject(editingItem);
                                editingItem = null;
                                //switchToCursor();
                            }
                            draw();
                        }
                    }
                    else {
                        if (isMouseDown) {
                            var pos = getCursorPosition(canvas, e);
                            if (editorMode == 'circle') {
                                editingItem = buildCircle(mousePos, pos, isCircleCenter);
                                addObject(editingItem);
                                editingItem = null;
                                draw();
                            }
                            else if (editorMode == 'oval') {
                                editingItem = buildOval(mousePos, pos);
                                addObject(editingItem);
                                //switchToCursor();
                                editingItem = null;
                                draw();
                            }
                            else if (editorMode == 'rect') {
                                editingItem = buildRect(mousePos, pos);
                                addObject(editingItem);
                                //switchToCursor();
                                editingItem = null;
                                draw();
                            }
                            else if (editorMode == 'pen' || editorMode == 'eraser') {
                                if (editingItem.data.length > 4) {
                                    editingItem.data.push(pos.x);
                                    editingItem.data.push(pos.y);
                                    addObject(editingItem);
                                }
                                editingItem = null;
                                draw();
                            }
                            else if (editorMode == 'line' || editorMode == 'line-oa' || editorMode == 'line-ta') {
                                if (e.shiftKey) {
                                    var dx = Math.abs(pos.x - editingItem.data[0]);
                                    var dy = Math.abs(pos.y - editingItem.data[1]);
                                    if (dx > dy) {
                                        editingItem.data[editingItem.data.length - 2] = pos.x;
                                        editingItem.data[editingItem.data.length - 1] = editingItem.data[1];
                                    }
                                    else {
                                        editingItem.data[editingItem.data.length - 2] = editingItem.data[0];
                                        editingItem.data[editingItem.data.length - 1] = pos.y;
                                    }
                                }
                                else {
                                    editingItem.data[2] = pos.x;
                                    editingItem.data[3] = pos.y;
                                }
                                addObject(editingItem);
                                editingItem = null;
                                draw();
                            }
                            else if (editorMode == 'shape') {
                                addObject(editingItem);
                                editingItem = null;
                                draw();
                            }
                        }
                    }
                    if (timerHandler > 0) {
                        clearInterval(timerHandler);
                        timerHandler = -1;
                    }
                    isMouseDown = false;
                }
            });
            function getCursorPosition(canvas, event) {
                const rect = canvas.getBoundingClientRect()
                var centerX = 40 + (axis.X.center + 1) * (canvas.width - 80) / 2;
                var centerY = 40 + (-axis.Y.center + 1) * (canvas.height - 80) / 2;
                const x = event.clientX - rect.left - centerX;
                const y = event.clientY - rect.top - centerY;
                return { x: x, y: y };
            }
            function buildRect(pos1, pos2) {
                var x = Math.min(pos1.x, pos2.x);
                var y = Math.min(pos1.y, pos2.y);
                var w = Math.abs(pos1.x - pos2.x);
                var h = Math.abs(pos1.y - pos2.y);
                return new Rect(x, y, w, h, graphLineStyle, lineWidth);
            }
            function buildCircle(center, pos, fromCenter) {
                if (fromCenter) {
                    return new Circle(center.x, center.y, mathUtils.distance(center, pos), graphLineStyle, lineWidth);
                }
                else {
                    var c = { x: (center.x + pos.x) / 2, y: (center.y + pos.y) / 2 }
                    return new Circle(c.x, c.y, mathUtils.distance(c, pos), graphLineStyle, lineWidth);
                }
            }
            function buildOval(center, pos) {
                return new Oval(center.x, center.y, Math.abs(center.x - pos.x), Math.abs(center.y - pos.y), graphLineStyle, lineWidth);
            }
        }

        function getSqDist(p1, p2) {

            var dx = p1.x - p2.x,
                dy = p1.y - p2.y;
            return dx * dx + dy * dy;
        }

        // square distance from a point to a segment
        function getSqSegDist(p, p1, p2) {

            var x = p1.x,
                y = p1.y,
                dx = p2.x - x,
                dy = p2.y - y;

            if (dx !== 0 || dy !== 0) {

                var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

                if (t > 1) {
                    x = p2.x;
                    y = p2.y;

                } else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }

            dx = p.x - x;
            dy = p.y - y;

            return dx * dx + dy * dy;
        }
        // rest of the code doesn't care about point format

        // basic distance-based simplification
        function simplifyRadialDist(points, sqTolerance) {

            var prevPoint = points[0],
                newPoints = [prevPoint],
                point;

            for (var i = 1, len = points.length; i < len; i++) {
                point = points[i];

                if (getSqDist(point, prevPoint) > sqTolerance) {
                    newPoints.push(point);
                    prevPoint = point;
                }
            }

            if (prevPoint !== point) newPoints.push(point);

            return newPoints;
        }

        function simplifyDPStep(points, first, last, sqTolerance, simplified) {
            var maxSqDist = sqTolerance,
                index;

            for (var i = first + 1; i < last; i++) {
                var sqDist = getSqSegDist(points[i], points[first], points[last]);

                if (sqDist > maxSqDist) {
                    index = i;
                    maxSqDist = sqDist;
                }
            }

            if (maxSqDist > sqTolerance) {
                if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
                simplified.push(points[index]);
                if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
            }
        }

        // simplification using Ramer-Douglas-Peucker algorithm
        function simplifyDouglasPeucker(points, sqTolerance) {
            var last = points.length - 1;

            var simplified = [points[0]];
            simplifyDPStep(points, 0, last, sqTolerance, simplified);
            simplified.push(points[last]);

            return simplified;
        }

        // both algorithms combined for awesome performance
        function simplify(array, tolerance, highestQuality) {

            if (array.length <= 4) return array;
            var points = [];
            for (var i = 0; i < array.length; i += 2) {
                points.push({ x: array[i], y: array[i + 1] });
            }
            var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

            points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
            points = simplifyDouglasPeucker(points, sqTolerance);
            var out = [];
            for (var i = 0; i < points.length; i++) {
                out.push(points[i].x);
                out.push(points[i].y);
            }
            return out;
        }
        function addObject(o) {
            data[dataLength] = o;
            dataLength++;
            canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
            raiseChangeEvent();
        }
        function drawGrid() {
            ctx.beginPath();
            ctx.lineWidth = 0.1;
            ctx.setLineDash([1, 1]);
            var x = canvas.width / 2;
            while (x < canvas.width) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                x += 24;
            }
            x = canvas.width / 2;
            while (x > 0) {
                x -= 24;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }
            x = canvas.height / 2;
            while (x < canvas.height) {
                ctx.moveTo(0, x);
                ctx.lineTo(canvas.width, x);
                x += 24;
            }
            x = canvas.height / 2;
            while (x > 0) {
                x -= 24;
                ctx.moveTo(0, x);
                ctx.lineTo(canvas.width, x);
            }
            ctx.stroke();
            ctx.strokeStyle = '#000';
            ctx.setLineDash([]);
            ctx.lineWidth = 0.8;
        }
        function drawAxis() {
            if (axisMode == 2 || axisMode == 3) {
                ctx.beginPath();
                //axis X
                ctx.moveTo(20, centerY);
                ctx.lineTo(canvas.width - 20, centerY);
                //arrow
                ctx.moveTo(canvas.width - 30, centerY + 5);
                ctx.lineTo(canvas.width - 20, centerY);
                ctx.lineTo(canvas.width - 30, centerY - 5);
                //Zero
                ctx.moveTo(centerX, centerY - 2);
                ctx.lineTo(centerX, centerY + 2);
                var x = centerX;
                //Step >0 : 1,2,3,4
                while (x < canvas.width - 32 - axis.X.step) {
                    x += axis.X.step;
                    ctx.moveTo(x, centerY - 2);
                    ctx.lineTo(x, centerY + 2);
                }
                //Step < 0 : -1,-2,-3,-4
                x = centerX;
                while (x > 32 + axis.X.step) {
                    x -= axis.X.step;
                    ctx.moveTo(x, centerY - 2);
                    ctx.lineTo(x, centerY + 2);
                }
                //Y AXIS
                ctx.moveTo(centerX, 20);
                ctx.lineTo(centerX, canvas.height - 20);
                ctx.moveTo(centerX - 2, centerY);
                ctx.lineTo(centerX + 2, centerY);
                //arrow
                ctx.moveTo(centerX + 5, 30);
                ctx.lineTo(centerX, 20);
                ctx.lineTo(centerX - 5, 30);
                var y = centerY;
                while (y < canvas.height - 32 - axis.Y.step) {
                    y += axis.Y.step;
                    ctx.moveTo(centerX - 2, y);
                    ctx.lineTo(centerX + 2, y);
                }
                while (y > 32 + axis.Y.step) {
                    y -= axis.Y.step;
                    ctx.moveTo(centerX - 2, y);
                    ctx.lineTo(centerX + 2, y);
                }
                ctx.stroke();
                ctx.font = "16px Arial";
                ctx.textAlign = "right";
                ctx.fillText(axis.X.label, canvas.width - 20, centerY + 22);
                ctx.textAlign = "center";
                ctx.fillText(axis.Y.label, centerX, 15);
            }
            if (axisMode == 3) {
                //Z AXIS
                //back
                var d = Math.min((canvas.width - centerX), (centerY)) * 0.8;
                var v = { x: d, y: 0 };
                v = mathUtils.rotateVector2(v, -60);
                ctx.beginPath();
                ctx.setLineDash([10, 4]);
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(v.x + centerX, v.y + centerY);
                ctx.stroke();
                ctx.beginPath();
                ctx.setLineDash([]);
                //arrow
                ctx.moveTo(v.x + centerX - 8, v.y + centerY + 6);
                ctx.lineTo(v.x + centerX, v.y + centerY);
                ctx.lineTo(v.x + centerX - 1, v.y + centerY + 10);
                //front
                d = Math.min((centerX), (canvas.height - centerY)) * 0.8;
                v = { x: -d, y: 0 };
                v = mathUtils.rotateVector2(v, -60);
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(v.x + centerX, v.y + centerY);
                //arrow
                //ctx.moveTo(centerX + 5, 30);
                //ctx.lineTo(centerX, 20);
                //ctx.lineTo(centerX - 5, 30);
                //var y = centerY;
                //while (y < canvas.height - 32 - axis.Y.step) {
                //    y += axis.Y.step;
                //    ctx.moveTo(centerX - 2, y);
                //    ctx.lineTo(centerX + 2, y);
                //}
                //while (y > 32 + axis.Y.step) {
                //    y -= axis.Y.step;
                //    ctx.moveTo(centerX - 2, y);
                //    ctx.lineTo(centerX + 2, y);
                //}
                ctx.stroke();
            }
        }
        function draw() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            updateCenter();
            ctx = canvas.getContext("2d");
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';
            if (axisMode > 0) {
                drawAxis();
            }
            ctx.save();
            ctx.translate(centerX, centerY);
            for (var i = 0; i < dataLength; i++) {
                data[i].draw(ctx, centerX, centerY, axis);
            }
            if (editingItem) {
                editingItem.draw(ctx, centerX, centerY, axis);
            }
            ctx.restore();
            if (showGrid) {
                drawGrid();
            }
            if (editorMode == 'eraser') {
                drawBuffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
        }
        function switchToCursor() {
            if (contextTool != null) {
                contextTool.find(".btn-graph-pointer").trigger("click");
            }
        }
        this.setContent = function (initData) {
            axis = initData && initData.axis ? initData.axis : axis;
            axisMode = initData && initData.axisMode ? initData.axisMode : axisMode;
            showGrid = initData && initData.showGrid != null ? initData.showGrid : showGrid;
            dataLength = initData && initData.dataLength != null ? initData.dataLength : 0;
            if (initData.objects) {
                data = [];
                for (var d of initData.objects) {
                    if (d.type == GraphType.circle) {
                        data.push(new Circle().fromData(d));
                    }
                    else if (d.type == GraphType.drawing) {
                        data.push(new Drawing().fromData(d));
                    }
                    else if (d.type == GraphType.spline) {
                        data.push(new SplineDrawing().fromData(d));
                    }
                    else if (d.type == GraphType.rect) {
                        data.push(new Rect().fromData(d));
                    }
                    else if (d.type == GraphType.circle) {
                        data.push(new Circle().fromData(d));
                    }
                    else if (d.type == GraphType.oval) {
                        data.push(new Oval().fromData(d));
                    }
                    else if (d.type == GraphType.image) {
                        data.push(new ImageDraw().fromData(d));
                    }
                    else if (d.type == GraphType.text) {
                        data.push(new GraphText().fromData(d));
                    }
                    else if (d.type == GraphType.line) {
                        data.push(new Line().fromData(d));
                    }
                    else if (d.type == GraphType.fx) {
                        data.push(new GraphFx(d.data, d.style, d.line));
                    }
                    else if (d.type == GraphType.shape) {
                        data.push(new GraphShape(d.data));
                    }
                }
            }
            updateCenter();
            setTimeout(function () {
                draw();
            }, 100);
        }
        this.getContent = function () {
            var graphs = [];
            for (var i = 0; i < dataLength && i < data.length; i++) {
                graphs.push(data[i].toData());
            }
            return {
                axisMode: axisMode,
                axis: axis,
                showGrid: showGrid,
                dataLength: dataLength,
                width: canvas.width,
                height: canvas.height,
                objects: graphs,
            };
        }
        this.buildContextTool = function (tool, options) {
            var t = new Date().getTime();
            let buttons = `
<div class="graph-tool-panel">
<div>
<div class="input-group-text form-check-inline pt-1 m-0">
  <input class="form-check-input m-0 mr-2" type="checkbox" id="ck-grid-${t}"${(showGrid ? "checked" : "")}>
<label class="form-check-label" for="ck-grid-${t}">${options.titleGrid}</label>
</div>
<div class="btn-group dropup" data-type='0' title='${options.titleLineStyle}'>
  <button type="button" class="btn btn-sm border dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
    <img src='/images/graph/axis-${axisMode}.png'>
  </button>
  <div class="dropdown-menu p-3" style='width:200px'>
    <label><input type="radio" class="select-axis" name="select-axis" value="0" ${axisMode == 0 ? "checked" : ""}>${options.titleNoAxis}</label>
    <label><input type="radio" class="select-axis" name="select-axis" value="2" ${axisMode == 2 ? "checked" : ""}>${options.titleAxis.format('XY')}</label>
    <label><input type="radio" class="select-axis" name="select-axis" value="3" ${axisMode == 3 ? "checked" : ""}>${options.titleAxis.format('XYZ')}</label>
    <div class='axis-property' style="display:${axisMode == 0 ? "none" : ""}"> 
        <div class="input-group">
            <input class='form-control axisX-label' style='width:90px' value='${axis.X.label}'/>
            <input type="range" class="form-range axisX-center" min="-50" max="50" value=${axis.X.center}">
        </div>
        <div class="input-group">
            <input class='form-control axisY-label' style='width:90px' value='${axis.Y.label}'/>
            <input type="range" class="form-range axisY-center" min="-50" max="50" value="${axis.Y.center}">
        </div>
        <div class="input-group">
            <span class='input-group-text' style="width:90px">Step</span>
            <input type="range" class="form-range axis-step" min="5" max="200" value="${axis.X.step}">
        </div>
     </div>
  </div>
</div>
</div><div>`;
            buttons += `<div>
<button type="button" class='btn btn-sm border btn-graph-undo' title='` + options.titleUndo + `'><i class="fas fa-undo"></i></button>
<button type="button" class='btn btn-sm border btn-graph-redo' title='` + options.titleRedo + `'><i class="fas fa-redo"></i></button>
<button type="button" class='btn btn-sm border btn-graph-tool btn-graph-pointer' data-type="pointer" title='` + options.titlePointer + `'><i class="fas fa-mouse-pointer"></i></button>
<div class="btn-group dropstart graph-line-style" data-type='0' title='` + options.titleLineStyle + `'>
  <button type="button" class="btn btn-sm border dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
    <img src='/images/graph/line_solid-icon.png'/>
  </button>
  <div class="dropdown-menu line-style-list" style='width:200px'>
     <li><a class='dropdown-item' data-type='0'><img src='/images/graph/line_solid.png'/></a></li>
     <li><a class='dropdown-item' data-type='1'><img src='/images/graph/line_dashed.png'/></a></li>
  </div>
</div>
<div title='`+ options.titleLineWidth + `' class='input-group' style='display:none'>
<input class="form-control graph-line-width" type='number' min='0.5' max='100' step='0.5'/><span class='input-group-text'>px<span>
</div>
<button type="button" class='btn btn-sm border btn-graph-tool' data-type="text" title='` + options.titleText + `'><i class="fas fa-font"></i></button>
<button type="button" class='btn btn-sm border btn-graph-tool' data-type="eraser" title='` + options.titleEraser + `'><i class="fa fa-eraser"></i></button>
<button type="button" class='btn btn-sm border btn-graph-tool' data-type="pen" title='` + options.titleFreeDrawing + `'><i class="fas fa-pen"></i></button>
<div class="btn-group dropstart">
  <button type="button" class="btn btn-sm border dropdown-toggle btn-graph-tool" data-type="line" data-bs-toggle="dropdown" aria-expanded="false">
    <img src='/images/graph/${editorMode.indexOf("line") == 0 ? editorMode : "line"}.png'/>
  </button>
  <div class="dropdown-menu line-list" style='width:200px'>
     <button type="button" class='btn btn-sm border btn-graph-line' data-type="line" title='` + options.titleLineDrawing + `'><img src='/images/graph/line.png'/></button>
     <button type="button" class='btn btn-sm border btn-graph-line' data-type="line-oa" title='` + options.titleLineDrawing + `'><img src='/images/graph/line-oa.png'/></button>
     <button type="button" class='btn btn-sm border btn-graph-line' data-type="line-ta" title='` + options.titleLineDrawing + `'><img src='/images/graph/line-ta.png'/></button>
  </div>
</div>
<button type="button" class='btn btn-sm border btn-graph-tool' data-type="polygon" title='` + options.titlePolygonDrawing + `'><img src='/images/graph/polygon.png'/></button>
<button type="button" class='btn btn-sm border btn-graph-tool' data-type="rect" title='` + options.titleRectangleDrawing + `'><img src='/images/graph/rect.png'/></button>
<div class="btn-group dropstart drd-function">
    <button type="button" class='btn btn-sm border btn-graph-tool dropdown-toggle' data-type="circle" data-bs-toggle="dropdown" aria-expanded="false" title='` + options.titleCircleDrawing + `'><img src='/images/graph/circle.png'/></button>
    <div class="dropdown-menu line-list" style='width:200px'>
     <div class="dropdown-item"><label for="circle-type-center"><input type="radio" name="circleType" checked id="circle-type-center">Trung tâm</label></div>
     <div class="dropdown-item"><label for="circle-type-edge"><input type="radio" name="circleType" id="circle-type-edge">Tiếp tuyến</label></div>
  </div>
</div>
<button type="button" class='btn btn-sm border btn-graph-tool' data-type="oval" title='` + options.titleOvalDrawing + `' ><img src='/images/graph/oval.png'/></button>
<div class="btn-group dropstart drd-shape">
    <button type="button" class='btn btn-sm border btn-graph-tool dropdown-toggle' data-type="shape" data-bs-toggle="dropdown" aria-expanded="false" title='` + options.titleShapeDrawing + `' ><img src='/images/graph/shapes/shape-${shapeType}.png'/></button>
    <div class="dropdown-menu shape-list" style='width:380px;max-width:90vw;max-height:400px;overflow-y:auto'>`;
            for (var group of ShapeTypes) {
                buttons += "<div class='border-bottom fw-bold m-2 p-2'>" + group.name + "</div>";
                buttons += `<div class="flex flex-wrap">`;
                for (var sType of group.shapes) {
                    buttons += `<button type="button" class='btn btn-sm border btn-graph-shape' data-type="${sType.id}"><img src='/images/graph/shapes/${sType.icon}'/></button>`;
                }
                buttons += `</div>`;
            }
            buttons += `</div>
</div>

<div class="btn-group dropstart drd-function" title='` + options.titleFunctionGraph + `' style='display:${axisMode == 2 ? "" : "none"}'>
  <button type="button" class="btn btn-sm border dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
    <img src='/images/graph/curve.png'/>
  </button>
  <div class="dropdown-menu" style='width:200px'>
     <div class="d-flex w-100"><div style='padding-top:6px'>y=</div><div class='flex-grow-1'><math-field class='graph-math-field' math-virtual-keyboard-policy="auto">x^2</math-field></div><button type="button" class="btn btn-sm btn-primary btn-function">OK</button></div>
  </div>
</div>
</div></div>`;

            tool.append(buttons);
            tool.find("button[data-type=" + editorMode + "]").addClass("selected");
            let lineWidthInput = tool.find(".graph-line-width");
            lineWidthInput.val(lineWidth);
            lineWidthInput.change(function () {
                if (editorMode == 'eraser') {
                    eraserWidth = parseFloat(lineWidthInput.val());
                }
                else {
                    lineWidth = parseFloat(lineWidthInput.val());
                }
            });
            let thisEditor = this;
            tool.find(".btn-graph-tool").on('click', function () {
                tool.find(".selected").removeClass("selected");
                $(this).addClass("selected");
                var type = $(this).data("type");
                if (type == 'eraser') {
                    drawBuffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    lineWidthInput.val(eraserWidth);
                }
                else {
                    lineWidthInput.val(lineWidth);
                }
                thisEditor.setMode(type);
            });
            if (isCircleCenter) {
                $("#circle-type-center").prop("checked", true);
            }
            else {
                $("#circle-type-edge").prop("checked", true);
            }
            tool.find("input[name=circleType]").on('change', function () {
                if (this.checked) {
                    tool.find(".selected").removeClass("selected");
                    $(this).closest(".dropup").find(".btn-graph-tool").addClass("selected");
                    isCircleCenter = this.id == "circle-type-center";
                }
            })
            let lineStyle = tool.find(".graph-line-style");
            lineStyle.data("type", graphLineStyle);
            lineStyle.find("button img").attr("src", lineStyle.find("a[data-type=" + graphLineStyle + "] img").attr("src").replace(".png", "-icon.png"));
            lineStyle.find(".dropdown-item").on('click', function () {
                graphLineStyle = parseInt($(this).data("type"));
                lineStyle.data("type", graphLineStyle);
                lineStyle.find("button img").attr("src", $(this).find("img").attr("src").replace(".png", "-icon.png"));
            });
            tool.find(".select-axis").on('change', function () {
                axisMode = parseInt(tool.find(".select-axis:checked").val());
                if (axisMode > 0) {
                    tool.find(".axis-property").show();
                }
                else {
                    tool.find(".axis-property").hide();
                }
                if (axisMode == 2) {
                    tool.find(".drd-function").show();
                }
                else {
                    tool.find(".drd-function").hide();
                }
                var toogle = $(this).closest(".btn-group").find(".dropdown-toggle");
                toogle.html("<img src='/images/graph/axis-" + axisMode + ".png'>");
                canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                raiseChangeEvent();
                draw();
            });
            tool.find(".line-list button").on('click', function () {
                var toogle = $(this).closest(".btn-group").find(".dropdown-toggle");
                toogle.html(this.innerHTML);
                toogle.addClass("selected");
                var type = $(this).data("type");
                thisEditor.setMode(type);
                toogle.data("type", type);
            });
            tool.find(".shape-list button").on('click', function () {
                var toogle = $(this).closest(".btn-group").find(".dropdown-toggle");
                toogle.html(this.innerHTML);
                toogle.addClass("selected");
                thisEditor.setShapeType(parseInt($(this).data("type")));
            });
            tool.find(".btn-graph-undo").on('click', function () {
                if (dataLength > 0) {
                    dataLength--;
                    canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                    raiseChangeEvent()
                    draw();
                }
            });
            tool.find(".btn-graph-redo").on('click', function () {
                if (dataLength < data.length) {
                    dataLength++;
                    canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                    raiseChangeEvent()
                    draw();
                }
            });
            tool.find("#ck-grid-" + t).on('change', function () {
                showGrid = this.checked;
                canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                raiseChangeEvent()
                draw();
            });
            tool.find('.drd-function .dropdown-menu').on('click', function (e) {
                e.stopPropagation();
            });
            tool.find(".btn-function").on('click', function () {
                tool.find('.drd-function .dropdown-menu').removeClass("show");
                var fx = tool.find(".graph-math-field")[0].getValue('latex-unstyled');
                if (fx && fx.length > 0) {
                    addObject(new GraphFx(fx, graphLineStyle));
                    draw();
                }
            });
            tool.find(".axisX-center").on('change', function () {
                var value = parseFloat(this.value);
                axis.X.center = value / 50.0;
                recalculateFunctions();
                canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                raiseChangeEvent();
                draw();
            });
            tool.find(".axisY-center").on('change', function () {
                var value = parseFloat(this.value);
                axis.Y.center = value / 50.0;
                recalculateFunctions();
                canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                raiseChangeEvent();
                draw();
            });
            tool.find(".axisX-label").on('change', function () {
                axis.X.label = this.value;
                canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                raiseChangeEvent();
                draw();
            });
            tool.find(".axisY-label").on('change', function () {
                axis.Y.label = this.value;
                canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                raiseChangeEvent();
                draw();
            });
            tool.find(".axis-step").on('change', function () {
                var value = parseFloat(this.value);
                axis.X.step = value;
                axis.Y.step = value;
                recalculateFunctions();
                canvas.setAttribute("data-graphs", JSON.stringify(canvas.editor.getContent()));
                raiseChangeEvent();
                draw();
            });
            editorMode = "pointer"
            return tool;
        }
        this.setMode = function (mode) {
            editorMode = mode;
            if (mode != "pointer") {
                canvas.style.cursor = "crosshair";
            }
            else {
                canvas.style.cursor = "default";
            }
        }
        this.setShapeType = function (type) {
            shapeType = type;
        }
        initCanvas();
        draw();
    }
    function createGraphEditors(elm) {
        var allGraphs = elm.querySelectorAll("tgraph");
        for (var g of allGraphs) {
            let canvas = document.createElement("canvas");
            canvas.tabid = 0;
            canvas.className = 'editor-graph';
            let data = JSON.parse(g.innerHTML);
            if (data && data.width) {
                canvas.clientWidth = data.width;
                canvas.width = data.width;
                $(canvas).css('width', data.width);
            }
            if (data && data.height) {
                canvas.clientHeight = data.height;
                canvas.height = data.height;
                $(canvas).css('height', data.height);
            }
            g.parentNode.insertBefore(canvas, g);
            g.remove();
            let editor = new GraphEditor(canvas);
            editor.setContent(data);
        }
    }
    function graphPlugin(elm, tool) {
        $(tool).append(`<button type='button' class='btn btn-sm btn-graph border' title='` + options.titleInsertGraph + `'><i class="fas fa-chart-line"></i></button>`);
        $(tool).find(".btn-graph").on('click', function () {
            restoreSelection();
            insertHtmlContent("&nbsp;<div><canvas id='new-editor-graph' tabid='0' class='editor-graph'></canvas></div>&nbsp;");
            var canvas = document.querySelector("#new-editor-graph");
            canvas.removeAttribute("id");
            canvas.width = Math.min($(elm).width() - 10, 600);
            canvas.height = 400;
            new GraphEditor(canvas);//new important
            canvas.click();
        });
        registerResize(elm, "CANVAS");
        callInitCallBack.push(() => {
            createGraphEditors(elm);
        });
    }
    function mathPlugin(elm, tool) {
        $(tool).append(`<button type='button' class='btn btn-sm border btn-math' title='` + options.titleInsertExpression + `'><i class="fas fa-square-root-alt"></i></button>`);
        $(tool).find(".btn-math").on('click', function () {
            restoreSelection();
            var font = $(tool).find(".font-select").val();
            insertHtmlContent(`<math-field id='new-math-eq' style='display: inline-block;vertical-align: middle;font-size: ` + (font ? parseInt(font) + 4 : font) + `px;' math-virtual-keyboard-policy="auto">y=f(x)</math-field><span>&nbsp;</span>`);
            var item = elm.querySelector("#new-math-eq");
            item.removeAttribute("id");
            $(item).trigger("focus");
        });
        elm.addEventListener("input", function () {
            var maths = elm.querySelectorAll("math-field");
            for (var i = 0; i < maths.length; i++) {
                if (maths[i].nextSibling == null) {
                    var textNode = document.createElement("span");
                    textNode.innerHTML = "&nbsp;";
                    maths[i].parentNode.append(textNode)
                }
                if (maths[i].previousSibling == null) {
                    var textNode = document.createElement("span");
                    textNode.innerHTML = "&nbsp;";
                    maths[i].parentNode.prepend(textNode)
                }
            }
        });
        var html = mathUtils.convertMathMLToMathJax(elm.innerHTML);
        html = mathUtils.convertLaTexToInput(html);
        elm.innerHTML = html;
    }
    let savedRange;
    function saveSelection() {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            savedRange = sel.getRangeAt(0);
        }
    }
    function restoreSelection() {
        if (savedRange != null) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }
        else {
            item.focus();
        }
    }
    function tablePlugin(elm, tool) {
        function initTool() {
            var html = `<div class="btn-group"><button class="btn btn-sm border dropdown-toggle" title='` + options.titleInsertTable + `' type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class='fa fa-table'></i></button><div class="dropdown-menu"><table>`;
            for (var i = 0; i < 10; i++) {
                html += "<tr>";
                for (var j = 0; j < 10; j++) {
                    html += "<td></td>";
                }
                html += "</tr>";
            }
            html += `</table></div></div>`;
            $(tool).append(html);
            $(tool).find("td").on("hover", function () {
                var $tr = $(this).closest("tr");
                var $table = $tr.closest("table");
                $table.find("td").removeClass("selected");
                var rows = $table.find("tr");
                var row = $tr.index();
                var col = $(this).index();
                for (var i = 0; i <= row; i++) {
                    var cells = $(rows[i]).find("td");
                    for (var j = 0; j <= col; j++) {
                        $(cells[j]).addClass("selected");
                    }
                }
            });
            $(tool).find("td").on('click', function () {
                restoreSelection();
                var $tr = $(this).closest("tr");
                var row = $tr.index();
                var col = $(this).index();
                var html = "<div><table id='new-inserted-table' style='border-collapse:collapse;width:" + $(elm).width() + "px'><tbody>";
                for (var i = 0; i <= row; i++) {
                    html += `<tr style='height:30px'>`;
                    for (var j = 0; j <= col; j++) {
                        html += `<td style='border:solid 0.5px #888;' tabindex="0"><div>&nbsp;</div></td>`;
                    }
                    html += `</tr>`;
                }
                html += "</tbody></table></div>";
                insertHtmlContent(html);
                var table = document.querySelector("#new-inserted-table");
                table.removeAttribute("id");
                table.style.width = "100%";
                $(table).find("td").resizable({
                    minWidth: 20,
                    stop: function (event, ui) {
                        raiseChangeEvent();
                    }
                });
                $(table).resizable({
                    minWidth: 20,
                    stop: function (event, ui) {
                        raiseChangeEvent();
                    }
                });
                new TableEditor(table);
            });
        }
        function TableEditor(table) {
            var isMouseDown = false;
            var selectRow = -1;
            var selectCol = -1;
            var thisTable = this;
            this.element = table;
            this.getSelectedCell = function () {
                return { row: selectRow, col: selectCol };
            }
            this.buildContextTool = function (tool, options) {
                var buttons = `<div class='d-flex'>
<button type="button" class='btn btn-sm border btn-add-row' title='${options.titleInsertRowBelows}'><img src='/images/table/add-row.png'/></button>
<button type="button" class='btn btn-sm border btn-add-col' title='${options.titleInsertColumnRight}'><img src='/images/table/add-column.png'/></button>
<button type="button" class='btn btn-sm border btn-delete-row' title='${options.titleDeleteRows}'><img src='/images/table/delete-row.png'/></button>
<button type="button" class='btn btn-sm border btn-delete-col' title='${options.titleDeleteColumns}'><img src='/images/table/delete-column.png'/></button>
<button type="button" class='btn btn-sm border btn-merge-cells' title='${options.titleMergeCells}'><img src='/images/table/merge.png'/></button>
<div class="input-group"><span class="input-group-text">${options.titleBorder}:</span><select style="max-width:80px" class='form-control form-select table-border'><option value='0'>0</option><option value='0.5'>0.5</option><option value='1'>1</option><option value='1.5'>1.5</option><option value='2'>2</option></select><span class="input-group-text">px</span></div>
<div class="input-group"><span class="input-group-text">${options.titleWidth}:</span><input style="width:110px;max-width:110px" class="form-control table-width" type="number"/><select  style="max-width:80px;min-width:80px" class='form-control form-select table-width-unit'><option value='px'>px</option><option value='%'>%</option></select></div>
</div>`;
                tool.append(buttons);
                tool.find(".table-border").val(table.rows[0].cells[0].style.borderWidth ? table.rows[0].cells[0].style.borderWidth.replace("px", "") : "")
                tool.find(".table-width").val(table.style.width ? table.style.width.replace("px", "").replace("%", "") : "100")
                tool.find(".table-width-unit").val(table.style.width ? (table.style.width.indexOf("%") > 0 ? "%" : "px") : "100")
                tool.find(".table-border").on('change', function () {
                    var value = $(this).val();
                    for (var i = 0; i < table.rows.length; i++) {
                        let row = table.rows[i];
                        for (var j = 0; j < row.cells.length; j++) {
                            row.cells[j].style.borderWidth = value + "px";
                        }
                    }
                    raiseChangeEvent();
                });
                tool.find(".table-width").on('change', function () {
                    var value = $(this).val();
                    table.style.width = value + tool.find(".table-width-unit").val();
                    raiseChangeEvent();
                });
                tool.find(".table-width-unit").on('change', function () {
                    var value = $(this).val();
                    table.style.width = tool.find(".table-width").val() + value;
                    raiseChangeEvent();
                });
                tool.find(".btn-add-row").on('click', function () {
                    var cell = thisTable.getSelectedCell();
                    var rows = $(thisTable.element).find("tr");
                    var row = $(rows[cell.row]).clone(true);
                    row.insertAfter($(rows[cell.row]));
                    raiseChangeEvent();
                });
                tool.find(".btn-add-col").on('click', function () {
                    var cell = thisTable.getSelectedCell();
                    var rows = $(thisTable.element).find("tr");
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var cells = $(row).find("td");
                        var n = $(cells[cell.col]).clone(true);
                        n.insertAfter($(cells[cell.col]));
                    }
                    raiseChangeEvent();
                });
                tool.find(".btn-delete-row").on('click', function () {
                    var cell = thisTable.getSelectedCell();
                    var rows = $(thisTable.element).find("tr");
                    var row = $(rows[cell.row]);
                    row.remove();
                    raiseChangeEvent();
                });
                tool.find(".btn-delete-col").on('click', function () {
                    var cell = thisTable.getSelectedCell();
                    var rows = $(thisTable.element).find("tr");
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var td = $(row).find("td")[cell.col];
                        if (td.colSpan && td.colSpan > 1) {
                            td.colSpan = td.colSpan - 1;
                        }
                        else {
                            row.deleteCell(cell.col);
                        }
                    }
                    raiseChangeEvent();
                });
                tool.find(".btn-merge-cells").on('click', function () {
                    var cells = $(thisTable.element).find("td.selected");
                    var maxR = 0, maxC = 0, minR = 1000000, minC = 1000000;
                    if (cells.length > 1) {
                        for (var i = 0; i < cells.length; i++) {
                            var cell = cells[i];
                            var c = $(cell).index();
                            var r = $(cell).closest("tr").index();
                            maxR = Math.max(maxR, r);
                            minR = Math.min(minR, r);
                            maxC = Math.max(maxC, c);
                            minC = Math.min(minC, c);
                        }
                        var list = [];
                        for (var i = 1; i < cells.length; i++) {
                            var cell = cells[i];
                            var c = $(cell).index();
                            var row = $(cell).closest("tr")[0];
                            for (var child of cell.childNodes) {
                                child.remove();
                                list.push(child);
                            }
                            row.deleteCell(c);
                        }
                        cells[0].rowSpan = maxR - minR + 1;
                        cells[0].colSpan = maxC - minC + 1;
                        for (var child of list) {
                            cells[0].appendChild(child);
                        }
                        raiseChangeEvent();
                    }
                });
                return tool;
            }
            var $td = $(table).find("td");
            $td.on("mousedown", function (e) {
                if (e.which == 1) {
                    isMouseDown = true;
                    $(table).find(".selected").removeClass("selected");
                    selectRow = $(this).parent().index();
                    selectCol = $(this).index();
                    this.focus();
                }
            });
            $td.on("mouseover", function (e) {
                if (e.which == 1) {
                    if (isMouseDown) {
                        var row = $(this).parent().index();
                        var col = $(this).index();
                        var dr = row < selectRow ? 1 : -1;
                        var dc = col < selectCol ? 1 : -1;
                        var rows = $(table).find("tr");
                        $(table).find(".selected").removeClass("selected");
                        var range = document.createRange();
                        var sel = window.getSelection();
                        range.setStart(this, 1);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        do {
                            var cells = $(rows[row]).find("td");
                            var c = col;
                            do {
                                $(cells[c]).addClass("selected");
                                cells[c].focus();
                                if (c == selectCol) break;
                                c += dc;
                            } while (true)
                            if (row == selectRow) break;
                            row += dr;
                        } while (true);
                    }
                }
            });
            $td.on("keydown", function (e) {
                if (e.which == 9 || e.which == 39) { //tab Key
                    e.preventDefault();
                    e.stopPropagation();
                    if (selectCol >= 0 && selectRow >= 0) {
                        var rows = $(table).find("tr");
                        while (rows.length > selectRow) {
                            var cells = $(rows[selectRow]).find("td");
                            if (cells.length > selectCol + 1) {
                                cells[selectCol + 1].focus();
                                var range = document.createRange()
                                var sel = window.getSelection()
                                range.setStart(cells[selectCol + 1], 1)
                                range.collapse(true)
                                sel.removeAllRanges()
                                sel.addRange(range);
                                selectCol++;
                                return false;
                            }
                            selectRow++;
                            selectCol = 0;
                            if (rows.length == selectRow) {
                                if (e.which == 39) break;
                                var $tr = $(rows[rows.length - 1]).clone();
                                $(rows[rows.length - 1]).parent().append($tr);
                                rows = $(table).find("tr");
                            }
                        }
                    }
                    return false;
                }
            });
            $(document).on("mouseup", function (e) {
                isMouseDown = false;
            });
            $(table).on('click', function () {
                if (selectionEditor != thisTable) {
                    needNewTool = true;
                    selectionEditor = thisTable;
                    showTool(table);
                    this.focus();
                }
            });
        }
        initTool();
        callInitCallBack.push(() => {
            var allTable = elm.querySelectorAll("table");
            for (var table of allTable) {
                $(table).find("td").resizable({
                    minWidth: 20,
                    stop: function (event, ui) {
                        raiseChangeEvent();
                    }
                });
                $(table).resizable({
                    minWidth: 20,
                    stop: function (event, ui) {
                        raiseChangeEvent();
                    }
                });
                new TableEditor(table);
            }
        });
    }
    function SearchInputControl(selector, callback) {
        var timerHandler = 0;
        var timerCount = 0;
        $(selector).on('change', function () {
            if (timerHandler > 0) {
                clearInterval(timerHandler);
                timerHandler = -1;
            }
            callback();
        });
    }
    function imagePlugin(elm, tool) {
        $(tool).append(`<button type='button' class='btn btn-sm btn-image border' title='${options.titleImage}'><i class="fas fa-image"></i></button>`);
        $(tool).find(".btn-image").on('click', function () {
            saveSelection();
            var html = `<div id="image-dialog" style="z-index:99999;position:fixed;top:0;left:0;right:0;bottom:0;background-color:#44444444">
                <div class="card" style="margin:auto;height:95vh;width:95vh;margin-top:2vh">
                    <div class="card-header d-flex"><div class="flex-grow-1">${options.titleImage}</div><a id="btn-image-close" class="btn-circle"><i class="fa fa-times"></i></a></div>
                    <div class="card-body" style="overflow:auto">
                        <div id="image-insert-step-1">
                            <ul class="nav nav-tabs" id="image-action-tabs" role="tablist">
                              <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="image-search-tab" data-tab="search" data-bs-toggle="tab" data-bs-target="#image-search-page" type="button" role="tab" aria-controls="image-search-page" aria-selected="true">${options.titleSearch}</button>
                              </li>
                              <li class="nav-item" role="presentation">
                                <button class="nav-link" id="image-upload-tab" data-tab="upload" data-bs-toggle="tab" data-bs-target="#image-upload-page" type="button" role="tab" aria-controls="image-upload-page" aria-selected="false">${options.titleLocal}</button>
                              </li>
                              <li class="nav-item" role="presentation">
                                <button class="nav-link" id="image-url-tab" data-tab="url" data-bs-toggle="tab" data-bs-target="#image-url-page" type="button" role="tab" aria-controls="image-url-page" aria-selected="false">${options.titleUrl}</button>
                              </li>
                            </ul>
                            <div class="tab-content border h-100" id="insert-image-tab-pages">
                              <div class="tab-pane fade show active" id="image-search-page" role="tabpanel" aria-labelledby="image-search-tab">
                              <div class="text-center pt-3">  
                                  <div class="selectgroup selectgroup-pills">
									    <label class="selectgroup-item">
										    <input type="radio" name="image_type" value="all" class="selectgroup-input" checked="">
										    <span class="selectgroup-button">${options.titleAll}</span>
									    </label>
									    <label class="selectgroup-item">
										    <input type="radio" name="image_type" value="photo" class="selectgroup-input">
										    <span class="selectgroup-button">Photo</span>
									    </label>
									    <label class="selectgroup-item">
										    <input type="radio" name="image_type" value="illustration" class="selectgroup-input">
										    <span class="selectgroup-button">Illustration</span>
									    </label>
									    <label class="selectgroup-item">
										    <input type="radio" name="image_type" value="vector" class="selectgroup-input">
										    <span class="selectgroup-button">Vector</span>
									    </label>
								    </div>  
                              </div>
                              <div class="d-flex">
                                    <div class='position-relative form-control m-auto' style="width:80%">
                                        <input class='form-control p-0 m-0 border-0' id="image-search-keyword" placeholder="${options.titleKeyword}" />
                                        <i class='fa fa-search position-absolute' style='right:5px;top:13px;'></i>
                                    </div>
                                </div>
                                <div class="container-fluid mt-4">
                                    <div class="row" id="image-search-list"></div>
                                </div>
                              </div>
                              <div class="tab-pane fade" id="image-upload-page" role="tabpanel" aria-labelledby="image-upload-tab">
                                <div>
                                   <div class="text-center pt-3">
                                        <div class="upload-btn-wrapper m-auto">
                                            <button class="btn">${options.titleSelectFile}</button> 
                                            <input id="image-upload-file" type="file" name="audio" accept="image/*"> 
                                        </div>
                                    </div>
                                    <div class="text-center p-3"><img id="local-image-result" src='/images/noimage.png' style='max-width:90%;display:block;margin:auto'/></div>
                                </div>
                              </div>
                              <div class="tab-pane fade" id="image-url-page" role="tabpanel" aria-labelledby="image-url-tab">
                                    <div class="input-group">
                                        <span class="input-group-text">${options.titleUrl}: </span>
                                        <input class="form-control" id="image-insert-url"/>
                                    </div>
                                    <div class="text-center"><img id="url-image-result" src='/images/noimage.png' style='max-width:90%;display:block;margin:auto'/></div>
                              </div>
                            </div>
                        </div>
                        <div class="h-100" id="image-insert-step-2" style="display:none;padding-top:50px">
                            <div class="progress">
                                <div id="image-progress-bar" class="progress-bar"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer text-center pt-2"><button type="button" id="btn-image-accept" class="btn btn-rounded btn-primary"><i class='fa fa-check'></i> ${options.titleAccept}</button></div>
                </div>
            </div>`;
            getDialogContainer(this).append(html);
            $("#btn-image-accept").on("click", function () {
                restoreSelection();
                var tab = getActiveTab();
                if (tab == 'search') {
                    var selected = $("#image-search-list .card-selected");
                    if (selected.length > 0) {
                        doInsertImageUrl(selected.data("src"));
                    }
                }
                else if (tab == 'upload') {
                    doInsertImageUrl(document.querySelector("#local-image-result").src);
                }
                else if (tab == 'url') {
                    doInsertImageUrl(document.querySelector("#url-image-result").src);
                }
            });
            $("#image-upload-file").on("change", function () {
                if (this.files.length == 0) return;
                let reader = new FileReader();
                reader.onload = (e) => {
                    var img = document.querySelector("#local-image-result");
                    img.onload = function () {
                    }
                    img.src = e.target.result;
                }
                reader.readAsDataURL(this.files[0]);
            });
            $("#image-insert-url").on("change", function () {
                var img = document.querySelector("#url-image-result");
                img.onload = function () {
                }
                img.src = this.value;
            });
            $("#btn-image-close").on("click", function () {
                $("#image-dialog").remove();
            });
            SearchInputControl("#image-search-keyword", function () {
                pageIndex = 1;
                doSearchImages();
            });
            $("input[name=image_type]").on("change", function () {
                pageIndex = 1;
                doSearchImages();
            });
            document.querySelector("#image-dialog .card-body").addEventListener('scroll', () => {
                if (getActiveTab() == "search" && !isLoading && this.scrollTop + this.clientHeight >= this.scrollHeight) {
                    if (pageIndex < pageCount) {
                        pageIndex++;
                        doSearchImages();
                    }
                }
            });
            function getActiveTab() {
                return $("#image-action-tabs .nav-link.active").data("tab");
            }
            function doInsertImageUrl(src) {
                var img = new Image();
                img.crossOrigin = "anonymous";
                $("#image-insert-step-1").hide();
                $("#image-insert-step-2").show();
                img.onload = function () {
                    var maxImageSize = options.maxImageSize ? options.maxImageSize : 600;
                    var newWidth = img.width;
                    var newHeight = img.height;
                    if (img.width > img.height) {
                        if (newWidth > maxImageSize) {
                            newWidth = maxImageSize;
                            newHeight = Math.round(img.height * maxImageSize / img.width);
                        }
                    }
                    else {
                        if (newHeight > maxImageSize) {
                            newHeight = maxImageSize;
                            newWidth = Math.round(img.width * maxImageSize / img.height);
                        }
                    }
                    var canvas = document.createElement("canvas");
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    var context = canvas.getContext("2d");
                    var scale = newWidth / img.width;
                    context.save();
                    context.translate(canvas.width / 2, canvas.height / 2);
                    context.scale(scale, scale);
                    context.drawImage(img, -img.width / 2, -img.height / 2);
                    context.restore();
                    canvas.toBlob(function (blob) {
                        blob.name = (new Date().getTime()).toString() + ".png";
                        uploadTempFile([blob], "#image-progress-bar", (result) => {
                            doInsert(result.data[0])
                        }, () => {
                            $("#image-insert-step-2").hide();
                            $("#image-insert-step-1").show();
                        });
                    }, 'image/png');
                    function doInsert(filePath) {
                        var nodes = insertHtmlContent(`<img style='min-width:20px;min-height:20px;display:inline' src="${filePath}"/>`);
                        raiseChangeEvent();
                        //setTimeout(function () {
                        //    $(nodes[0]).resizable({
                        //        resize: function () {
                        //            raiseChangeEvent();
                        //        }
                        //    });
                        //}, 1000);
                        $("#image-dialog").remove();
                    }
                }
                img.src = src;
            }
            var pageIndex = 1;
            const pageSize = 20;
            var pageCount = 1;
            var isLoading = false;
            function doSearchImages() {
                let keyword = $("#image-search-keyword").val();
                let image_type = $("input[name=image_type]:checked").val();
                if (!keyword) return;
                isLoading = true;
                $.ajax({
                    url: "https://pixabay.com/api/?key=48748211-53d62a80e91fd605ffb442fb4&q=" + keyword + "&image_type=" + image_type + "&page=" + pageIndex + "&per_page=" + pageSize,
                    type: "GET",
                    success: function (result) {
                        pageCount = result.totalHits;
                        let html = "";
                        for (var i = 0; i < result.hits.length; i++) {
                            var item = result.hits[i]
                            html += `<div class="col-sm-6 col-md-4 col-lg-3 col-xl-2 p-1"><div class='image-item p-1' data-src='${item.largeImageURL}' ><img class='w-100' src="${item.previewURL}"></div></div>`;
                        }
                        if (pageIndex == 1) {
                            $("#image-search-list").html(html);
                        }
                        else {
                            $("#image-search-list").append(html);
                        }
                        $("#image-search-list .image-item").on("click", function () {
                            $("#image-search-list .card-selected").removeClass("card-selected");
                            $(this).addClass("card-selected");
                        });
                        $("#image-search-list .image-item img").on("click", function () {
                            $("#image-search-list .card-selected").removeClass("card-selected");
                            $(this).parent().addClass("card-selected");
                        });
                        isLoading = false;
                    }
                });
            }
        });
        registerResize(elm, "IMG")
    }
    function getDialogContainer(obj) {
        var container = $(obj).closest(".modal-body");
        if (container.length == 0) {
            container = $("body");
        }
        return container;
    }
    function registerResize(elm, tagName) {
        elm.addEventListener("mousedown", function (event) {
            if (event.target.tagName === tagName && event.offsetX > event.target.offsetWidth - 16 && event.offsetY > event.target.offsetHeight - 16) {
                const img = event.target;
                let startX = event.clientX;
                let startY = event.clientY;
                let startWidth = parseInt(document.defaultView.getComputedStyle(img).width, 10);
                let startHeight = parseInt(document.defaultView.getComputedStyle(img).height, 10);

                function resize(event) {
                    img.style.width = startWidth + event.clientX - startX + 'px';
                    img.style.height = startHeight + event.clientY - startY + 'px';
                    if (img.onSizeChanged) {
                        img.onSizeChanged();
                    }
                }

                function stopResize() {
                    document.documentElement.removeEventListener('mousemove', resize, false);
                    document.documentElement.removeEventListener('mouseup', stopResize, false);
                    raiseChangeEvent();
                }

                document.documentElement.addEventListener('mousemove', resize, false);
                document.documentElement.addEventListener('mouseup', stopResize, false);
            }
        });
    }
    function aiPlugin(elm, tool) {
        $(tool).append(`<button type='button' class='btn btn-sm btn-ai border' title='${options.ai.titleAI}'><i class="fas fa-robot"></i></button>`);
        $(tool).find(".btn-ai").on('click', function () {
            saveSelection();
            var html = `<div id="ai-dialog" style="z-index:99999;position:fixed;top:0;left:0;right:0;bottom:0;background-color:#44444444">
                <div class="card" style="margin:auto;height:80vh;width:90vh;margin-top:10vh">
                    <div class="card-header d-flex"><div class="flex-grow-1">${options.ai.titleAI}</div><a id="btn-ai-close" class="btn-circle"><i class="fa fa-times"></i></a></div>
                    <div class="card-body" style="overflow:auto">
                        <div class="form-group" id="ai-step-1">
                           <div class="d-flex"><label class="control-label flex-grow-1">Prompt</label>${options.ai.titleSimulationIntro}
                            <div class="form-check" title="" style='display:none'>
                              <input class="form-check-input" type="radio" name="aigen" id="ai-gen-simulation" checked>
                              <label class="form-check-label" for="ai-gen-simulation">
                                ${options.ai.titleSimulation}
                              </label>
                            </div>
                            <div class="form-check" style='display:none'>
                              <input class="form-check-input" type="radio" name="aigen" id="ai-gen-image">
                              <label class="form-check-label" for="ai-gen-image">
                                ${options.ai.titleImage}
                              </label>
                            </div>
                           </div>
                            <div class="position-relative" style="min-height:200px">
                                <textarea id="ai-prompt" class="form-control" style="position:absolute;top:0px;right:0px;bottom:0px;left:0px" ></textarea>
                                <button id="btn-ai-generate" style="position:absolute;right:10px;bottom:10px" type="button" class="btn btn-sm btn-outline-primary"><i class='fa fa-play'></i></button>
                            </div>
                        </div>
                        <div class="form-group h-100" id="ai-step-2" style="display:none;padding-top:50px">
                            <div class="loader"></div>
                        </div>
                        <div class="form-group h-100" id="ai-step-3" style="display:none">
                           <div id="ai-result"></div>
                           <div class="text-center pt-2"><button id="btn-ai-back" type="button" class="btn btn-sm btn-rounded btn-outline-secondary"><i class='fa fa-arrow-left'></i> ${options.titleBack}</button><button type="button" id="btn-ai-accept" class="btn btn-sm btn-rounded btn-primary"><i class='fa fa-check'></i> ${options.titleAccept}</button></div>
                        </div>
                    </div>
                </div>
            </div>`;
            $("body").append(html);
            $("#btn-ai-back").on("click", function () {
                $("#ai-step-3").hide();
                $("#ai-step-1").show();
            });
            $("#btn-ai-close").on("click", function () {
                $("#ai-dialog").remove();
            });
            $("#btn-ai-accept").on("click", function () {
                restoreSelection();
                insertHtmlContent($("#ai-result").html());
                renderAllSimulations(item);
                raiseChangeEvent();
                $("#ai-dialog").remove();
            });
            $("#btn-ai-generate").on("click", function () {
                $("#ai-step-1").hide();
                $("#ai-step-2").show();
                var isSimulation = $("#ai-gen-simulation").is(":checked");
                var url = isSimulation ? options.ai.urlGenerateSimulationCode : options.ai.urlGenerateImage;
                $.ajax({
                    url: url,
                    type: "POST",
                    data: { prompt: $("#ai-prompt").val() },
                    success: function (result) {
                        $("#ai-step-1").hide();
                        if (isSimulation) {
                            $("#ai-result").html(`<iframe class="tex-simulation" data-src="${encodeURIComponent(result.data)}"></iframe>`);
                            renderAllSimulations("#ai-step-3");
                        }
                        else {
                            $("#ai-result").html(`<img class="tex-image" src='${result.data}'/>`);
                        }
                        $("#ai-step-2").hide();
                        $("#ai-step-3").show();
                    }
                });
            });
        });
        callInitCallBack.push(() => {
            renderAllSimulations(item);
        });
    }
    function audioPlugin(elm, tool) {
        $(tool).append(`<button type='button' class='btn btn-sm btn-audio border' title='${options.titleAudio}'><i class="fas fa-file-audio"></i></button>`);
        $(tool).find(".btn-audio").on('click', function () {
            saveSelection();
            var html = `<div id="editor-dialog" style="z-index:99999;position:fixed;top:0;left:0;right:0;bottom:0;background-color:#44444444">
                <div class="card" style="margin:auto;width:400px;margin-top:10vh">
                    <div class="card-header d-flex"><div class="flex-grow-1">${options.titleAudio}</div><a id="btn-audio-close" class="btn-circle"><i class="fa fa-times"></i></a></div>
                    <div class="card-body" style="overflow:auto">
                        <div class="form-group" id="audio-step-1">
                            <div class="upload-btn-wrapper m-auto">
                                <button class="btn">Upload Audio</button> 
                                <input  id="audio-upload-file" type="file" name="audio" accept="audio/*"> 
                            </div>
                        </div>
                        <div class="form-group h-100" id="audio-step-2" style="display:none;padding-top:50px">
                            <div class="progress">
                                <div id="audio-progress-bar" class="progress-bar"></div>
                            </div>
                        </div>
                        <div class="form-group h-100" id="audio-step-3" style="display:none">
                           <div id="audio-result" class="tex-audio"></div>
                           <div class="text-center pt-2 border-top mt-2"><button id="btn-audio-back" type="button" class="btn btn-rounded btn-outline-secondary"><i class='fa fa-arrow-left'></i> ${options.titleBack}</button><button type="button" id="btn-audio-accept" class="btn btn-rounded btn-primary"><i class='fa fa-check'></i> ${options.titleAccept}</button></div>
                        </div>
                    </div>
                </div>
            </div>`;
            $("body").append(html);
            $("#btn-audio-back").on("click", function () {
                $("#audio-step-3").hide();
                $("#audio-step-1").show();
            });
            $("#btn-audio-close").on("click", function () {
                $("#editor-dialog").remove();
            });
            $("#btn-audio-accept").on("click", function () {
                restoreSelection();
                insertHtmlContent($("#audio-result").html());
                raiseChangeEvent();
                $("#editor-dialog").remove();
            });
            $("#audio-upload-file").on("change", function () {
                if (this.files.length > 0) {
                    var fileSelect = this;
                    $("#audio-step-1").hide();
                    $("#audio-step-2").show();
                    uploadTempFile(this.files, "#audio-progress-bar", (result) => {
                        $("#audio-step-1").hide();
                        var html = '';
                        for (var i = 0; i < result.data.length; i++) {
                            html += "<audio controls src='" + result.data[i] + "'/>";
                        }
                        $("#audio-result").html(html);
                        $("#audio-step-2").hide();
                        $("#audio-step-3").show();
                        fileSelect.value = "";
                    }, () => {
                        fileSelect.value = "";
                    });
                }
            });
        });
    }
    function videoPlugin(elm, tool) {
        $(tool).append(`<button type='button' class='btn btn-sm btn-video border' title='${options.titleVideo}'><i class="fas fa-file-video"></i></button>`);
        $(tool).find(".btn-video").on('click', function () {
            saveSelection();
            var html = `<div id="editor-dialog" style="z-index:99999;position:fixed;top:0;left:0;right:0;bottom:0;background-color:#44444444">
                <div class="card" style="margin:auto;height:80vh;width:90vh;margin-top:10vh">
                    <div class="card-header d-flex"><div class="flex-grow-1">${options.titleVideo}</div><a id="btn-video-close" class="btn-circle"><i class="fa fa-times"></i></a></div>
                    <div class="card-body" style="overflow:auto">
                        <div class="form-group" id="video-step-1">
                            <div class="upload-btn-wrapper">
                                <button class="btn">Upload Video</button> 
                                <input id="video-upload-file" type="file" name="video" accept="video/*"> 
                            </div>
                        </div>
                        <div class="form-group h-100" id="video-step-2" style="display:none;padding-top:50px">
                            <div class="progress">
                                <div id="video-progress-bar" class="progress-bar"></div>
                            </div>
                        </div>
                        <div class="form-group h-100" id="video-step-3" style="display:none">
                           <div id="video-result" class="tex-video"></div>
                           <div class="text-center pt-2 border-top mt-2"><button id="btn-video-back" type="button" class="btn btn-rounded btn-outline-secondary"><i class='fa fa-arrow-left'></i> ${options.titleBack}</button><button type="button" id="btn-video-accept" class="btn btn-rounded btn-primary"><i class='fa fa-check'></i> ${options.titleAccept}</button></div>
                        </div>
                    </div>
                </div>
            </div>`;
            $("body").append(html);
            $("#btn-video-back").on("click", function () {
                $("#video-step-3").hide();
                $("#video-step-1").show();
            });
            $("#btn-video-close").on("click", function () {
                $("#editor-dialog").remove();
            });
            $("#btn-video-accept").on("click", function () {
                restoreSelection();
                insertHtmlContent($("#video-result").html());
                raiseChangeEvent();
                $("#editor-dialog").remove();
            });
            $("#video-upload-file").on("change", function () {
                if (this.files.length > 0) {
                    var fileSelect = this;
                    $("#video-step-1").hide();
                    $("#video-step-2").show();
                    uploadTempFile(this.files, "#video-progress-bar", (result) => {
                        $("#video-step-1").hide();
                        var html = '';
                        for (var i = 0; i < result.data.length; i++) {
                            html += "<video controls src='" + result.data[i] + "'/>";
                        }
                        $("#video-result").html(html);
                        $("#video-step-2").hide();
                        $("#video-step-3").show();
                        fileSelect.value = "";
                    }, () => {
                        fileSelect.value = "";
                    });
                }
            });
        });
    }
    function youtubePlugin(elm, tool) {
        $(tool).append(`<button type='button' class='btn btn-sm btn-youtube border' title='${options.titleYoutube}'><i class="fab fa-youtube"></i></button>`);
        $(tool).find(".btn-youtube").on('click', function () {
            saveSelection();
            var html = `<div id="youtube-dialog" style="z-index:99999;position:fixed;top:0;left:0;right:0;bottom:0;background-color:#44444444">
                <div class="card" style="margin:auto;width:90vh;margin-top:10vh">
                    <div class="card-header d-flex"><div class="flex-grow-1">${options.titleYoutube}</div><a id="btn-youtube-close" class="btn-circle"><i class="fa fa-times"></i></a></div>
                    <div class="card-body">
                        <div class="form-group w-100">
                            <label class="control-label">${options.titleUrl}</label>
                           <input id="youtube-result" class="form-control" type="text" />
                        </div>
                    </div>
                   <div class="card-footer text-center">
                   <button type="button" id="btn-youtube-accept" class="btn btn-rounded btn-primary"><i class='fa fa-check'></i> ${options.titleAccept}</button>
                   </div>
                </div>
            </div>`;
            $("body").append(html);
            $("#btn-youtube-accept").on("click", function () {
                restoreSelection();
                const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                const match = $("#youtube-result").val().match(regex);
                var videoId = match ? match[1] : null;
                if (videoId) {
                    var html = `<iframe src="https://www.youtube.com/embed/${videoId}" style="width:100%;aspect-ratio:1.5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
                    insertHtmlContent(html);
                    raiseChangeEvent();
                    $("#youtube-dialog").remove();
                }
            });
            $("#btn-youtube-close").on("click", function () {
                $("#youtube-dialog").remove();
                restoreSelection();
            });
        });
    }
    function htmlPlugin(elm, tool) {
        $(tool).append(`<button type='button' class='btn btn-sm btn-html border' title='${options.titleHtml}'><i class="fas fa-code"></i></button>`);
        $(tool).find(".btn-html").on('click', function () {
            saveSelection();
            let beautifiedHTML = html_beautify(getContent(), {
                indent_size: 2,  // Số khoảng trắng mỗi tab
                wrap_line_length: 80,  // Giới hạn độ dài dòng
                preserve_newlines: true,  // Giữ các dòng trống
                max_preserve_newlines: 1, // Số dòng trống tối đa được giữ
                indent_with_tabs: false,  // Sử dụng dấu cách thay vì tab
                end_with_newline: true
            });
            var html = `<div id="code-dialog" style="z-index:99999;position:fixed;top:0;left:0;right:0;bottom:0;background-color:#44444444">
                <div class="card" style="margin:auto;width:90%;height:90vh;margin-top:5vh">
                    <div class="card-header d-flex"><div class="flex-grow-1">${options.titleHtml}</div><a id="btn-code-close" class="btn-circle"><i class="fa fa-times"></i></a></div>
                    <div class="card-body">
                        <textarea id="code-result" class="border rounded w-100 h-100" >${beautifiedHTML}</textarea>
                    </div>
                    <div class="card-footer text-center">
                    <button type="button" id="btn-code-accept" class="btn btn-rounded btn-primary"><i class='fa fa-check'></i> ${options.titleAccept}</button>
                    </div>
                </div>
            </div>`;
            $("body").append(html);
            //const editor = CodeMirror.fromTextArea(document.querySelector("#code-result"),{
            //    mode: "htmlmixed",
            //    lineWrapping: true,
            //    matchBrackets: true,
            //    autoCloseTags: true
            //});
            //editor.setValue(beautifiedHTML);
            //setTimeout(() => {
            //    editor.refresh();
            //}, 100);
            $("#btn-code-accept").on("click", function () {
                selectAll();
                insertHtmlContent($("#code-result").val());
                raiseChangeEvent();
                $("#code-dialog").remove();
            });
            $("#btn-code-close").on("click", function () {
                $("#code-dialog").remove();
                restoreSelection();
            });
        });
    }
    function uploadTempFile(files, progressSelector, onSuccess, onError) {
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            formData.append("file-" + i, files[i], files[i].name);
        }
        $.ajax({
            url: options.urlUploadFile,
            type: "POST",
            data: formData,
            xhr: () => {
                var xhr = new XMLHttpRequest();
                xhr.upload.addEventListener('progress', function (event) {
                    if (event.lengthComputable) {
                        var percentComplete = (event.loaded / event.total) * 100;
                        $(progressSelector).css('width', percentComplete + '%');
                    }
                });
                return xhr;
            },
            processData: false,
            contentType: false,
            success: onSuccess,
            error: onError
        });
    }
    function selectAll() {
        const range = document.createRange();
        range.selectNodeContents(item);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    function showTool(contextElement) {
        contextTool = $(".text-editor-holder .selection-tool");
        if (selectionEditor == null) {
            contextTool.remove();
            contextTool = null;
            return;
        }
        var parent = $(contextElement).closest(".text-editor-holder");
        if (contextTool.length == 0) {
            contextTool = $(`<div class='selection-tool'></div>`);
            parent.append(contextTool);
            // $(contextTool).draggable();
        }
        else {
            if (!$(item).parent()[0].contains(contextTool[0])) {
                parent.append(contextTool);
            }
        }

        var last = $(selectionEditor.element);
        var offset = last.offset();
        if (!needNewTool && contextTool[0].innerHTML != null && contextTool[0].innerHTML.length > 10) {
            // contextTool.css("top", offset.top - contextTool.height()-100);
            // contextTool.css("left", ($(item).width() - contextTool.width()) / 2);
            return;
        }
        contextTool.html("");
        selectionEditor.buildContextTool(contextTool, options);
        $.fn.currentEditor.ensureViewVisible(50);
        // contextTool.css("top", offset.top - contextTool.height() - 100);
        // contextTool.css("left", ($(item).width() - contextTool.width()) / 2);
    }
    renderEditor(item);
    item.addEventListener("focus", function () {
        $.fn.currentEditor = thisTextEditor;
    });
    item.addEventListener("click", function () {
        $.fn.currentEditor = thisTextEditor;
    });
    item.addEventListener("blur", function () {
        saveSelection();
    });
    item.addEventListener("mouseup", function () {
        saveSelection();
    });
    var currentStackIndex = 0;
    function undo() {
        if (currentStackIndex > 0 && stacks.length > 0) {
            currentStackIndex = currentStackIndex - 1;
            selectAll();
            insertHtmlContent(stacks[currentStackIndex]);
            raiseChangeEvent(-1, false);
        }
    }
    function redo() {
        if (currentStackIndex < stacks.length - 1) {
            currentStackIndex = currentStackIndex + 1;
            selectAll();
            insertHtmlContent(stacks[currentStackIndex]);
            raiseChangeEvent(-1, false);
        }
    }
    item.addEventListener("keyup", function (e) {
        saveSelection();
        if (e.ctrlKey && (e.key == "z" || e.key == "Z") && stacks.length > 0) {
            undo();
            e.preventDefault();
        }
        else {
            raiseChangeEvent();
        }
    });
}
