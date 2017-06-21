(function (window, document) {

    var _ = function () {
        var _, funcsRequestAnimation = [];
        return _ = {
            random: function (min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            },
            sample: function (arr) {
                return arr[_.random(0, arr.length - 1)];
            },
            remove: function (arr, value) {
                var idx = arr.indexOf(value);

                idx !== -1 && arr.splice(idx, 1);

                return arr;
            },
            filter: function (arr, call) {
                var _arr = [], v, k;

                for (k in arr) {
                    if (arr.hasOwnProperty(k) && call.call(v = arr[k], v, k)) {
                        _arr.push(v);
                    }
                }

                return _arr;
            },
            shuffle: function (a) {
                var arr = a, j, x, i;

                for (i = arr.length; i; i--) {
                    j = _.random(0, i - 1);
                    x = arr[i - 1];
                    arr[i - 1] = arr[j];
                    arr[j] = x;
                }
                return arr;
            },
            fill: function (len, value) {
                var arr = [], i;

                for (i = 0; i < len; i++) {
                    arr.push(_.clone(value));
                }

                return arr;
            },
            each: function (arr, call) {
                if (Array.isArray(arr)) {
                    for (var i = 0, l = arr.length; i < l; i++) {
                        call.call(arr[i], arr[i], i)
                    }
                    return;
                }
                for (var k in arr) {
                    if (arr.hasOwnProperty(k)) {
                        call.call(arr[k], arr[k], k)
                    }
                }
            },
            map: function (arr, call) {
                _.each(arr, function (v, k) {
                    arr[k] = call.call(v, v, k);
                });

                return arr;
            },
            clone: function (obj) {
                // Handle the 3 simple types, and null or undefined
                if (null == obj || "object" != typeof obj) return obj;

                var copy;

                // Handle Date
                if (obj instanceof Date) {
                    copy = new Date();
                    copy.setTime(obj.getTime());
                    return copy;
                }

                // Handle Array
                if (obj instanceof Array) {
                    copy = [];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        copy[i] = _.clone(obj[i]);
                    }
                    return copy;
                }

                // Handle Object
                if (obj instanceof Object) {
                    copy = new obj.constructor();
                    for (var attr in obj) {
                        if (obj.hasOwnProperty(attr)) copy[attr] = _.clone(obj[attr]);
                    }
                    return copy;
                }

                throw new Error("Unable to copy obj! Its type isn't supported.");
            },
            extends: function (obj1, obj2) {
                for (var k in obj2) {
                    if (obj2.hasOwnProperty(k)) {
                        obj1[k] = obj2[k];
                    }
                }
                return obj1;
            },
            extendsClass: function (child, parent) {
                for (var key in parent) {
                    if (parent.hasOwnProperty(key))
                        child[key] = parent[key];
                }
                /** @constructor */
                function Ctor() {
                    this.constructor = child;
                }

                Ctor.prototype = parent.prototype;
                child.prototype = new Ctor();
                child.__super__ = parent.prototype;
                return child;
            },
            prototize: function (clazz, methods) {
                _.each(methods, function (method, name) {
                    clazz.prototype[name] = method;
                });
                clazz.constructor = clazz;
            },
            inherits: function (child, parent, methods) {
                _.extendsClass(child, parent);
                _.prototize(child, methods);
            },
            requestAnimation: function (func) {
                if (funcsRequestAnimation.length === 0) {
                    requestAnimationFrame(function () {
                        while (funcsRequestAnimation.length) {
                            funcsRequestAnimation.shift().call(this);
                        }
                    })
                }

                funcsRequestAnimation.push(func);
            }
        }
    }();

    var Tick = (function () {
        var ticks = {};

        return {
            interval: function (name, callback, time) {
                if (ticks[name] === null || ticks[name] === undefined) {
                    ticks[name] = setInterval(callback, time);
                }

                return ticks[name];
            },
            timeout: function (name, callback, time) {
                if (ticks[name] === null || ticks[name] === undefined) {
                    ticks[name] = setTimeout(function () {
                        callback();
                        delete ticks[name];
                    }, time);
                }

                return ticks[name];
            },

            clear: function (name) {
                if (ticks[name] !== null || ticks[name] !== undefined) {
                    clearTimeout(ticks[name]);
                    delete ticks[name];
                }
            }
        };
    })();

    var Generator = (function () {

        function startPos(options) {
            var posX, posY, start = options.start, height = options.height, width = options.width;

            switch (start) {
                case 1:
                case 'TR':
                    posX = 0;
                    posY = width - 1;
                    break;
                case 2:
                case 'BL':
                    posX = height - 1;
                    posY = 0;
                    break;
                case 3:
                case 'BR':
                    posX = height - 1;
                    posY = width - 1;
                    break;
                case 4:
                case 'TC':
                    posX = 0;
                    posY = (width - 1) / 2;
                    break;
                case 5:
                case 'RC':
                    posX = (height - 1) / 2;
                    posY = width - 1;
                    break;
                case 6:
                case 'BC':
                    posX = height - 1;
                    posY = (width - 1) / 2;
                    break;
                case 7:
                case 'LC':
                    posX = (height - 1) / 2;
                    posY = 0;
                    break;
                case 0:
                case 'TL':
                default:
                    posX = 0;
                    posY = 0;
            }

            return {x: posX, y: posY};
        }

        function getPosX(posX, height) {
            if (posX >= height) {
                posX = posX - height;
            } else if (posX < 0) {
                posX = height + posX;
            }

            return posX;
        }

        function getPosY(posY, width) {
            if (posY >= width) {
                posY = posY - width;
            } else if (posY < 0) {
                posY = width + posY;
            }

            return posY;
        }

        function pos(matrix, x, y) {
            x = getPosX(x, matrix.length);
            if (matrix[x] !== undefined) {
                y = getPosY(y, matrix[x].length);
                if (matrix[x][y] !== undefined) {
                    return matrix[x][y];
                }
            }
            return null;
        }

        return {
            maze: function (options) {
                var moves = [], maze, last = null,
                    height = options.height, width = options.width,
                    start = startPos(options),
                    posX = start.x,
                    posY = start.y;

                maze = _.fill(height, _.fill(width, 1));

                maze[posX][posY] = 0;

                moves.push(posY + posX * width);

                while (moves.length) {
                    var possibleDirections = [];

                    pos(maze, posX - 2, posY) === 1 && pos(maze, posX - 1, posY) === 1 && possibleDirections.push("N");
                    pos(maze, posX + 2, posY) === 1 && pos(maze, posX + 1, posY) === 1 && possibleDirections.push("S");
                    pos(maze, posX, posY - 2) === 1 && pos(maze, posX, posY - 1) === 1 && possibleDirections.push("W");
                    pos(maze, posX, posY + 2) === 1 && pos(maze, posX, posY + 1) === 1 && possibleDirections.push("E");

                    if (possibleDirections.length) {
                        var move = last = _.sample(possibleDirections);
                        switch (move) {
                            case "N":
                                maze[getPosX(posX - 2, height)][posY] = 0;
                                maze[getPosX(posX - 1, height)][posY] = 0;
                                posX = getPosX(posX - 2, height);
                                break;
                            case "S":
                                maze[getPosX(posX + 2, height)][posY] = 0;
                                maze[getPosX(posX + 1, height)][posY] = 0;
                                posX = getPosX(posX + 2, height);
                                break;
                            case "W":
                                maze[posX][getPosY(posY - 2, width)] = 0;
                                maze[posX][getPosY(posY - 1, width)] = 0;
                                posY = getPosY(posY - 2, width);
                                break;
                            case "E":
                                maze[posX][getPosY(posY + 2, width)] = 0;
                                maze[posX][getPosY(posY + 1, width)] = 0;
                                posY = getPosY(posY + 2, width);
                                break;
                        }
                        moves.push(posY + posX * width);
                    } else {
                        var availables = [];

                        pos(maze, posX - 2, posY) === 0 && pos(maze, posX - 3, posY) === 1 && availables.push('N');
                        pos(maze, posX + 2, posY) === 0 && pos(maze, posX + 3, posY) === 1 && availables.push('S');
                        pos(maze, posX, posY - 2) === 0 && pos(maze, posX, posY - 3) === 1 && availables.push('W');
                        pos(maze, posX, posY + 2) === 0 && pos(maze, posX, posY + 3) === 1 && availables.push('E');

                        availables.length > 1 && _.remove(availables, last);

                        switch (_.sample(availables)) {
                            case "N":
                                maze[getPosX(posX - 1, height)][posY] = 0;
                                break;
                            case "S":
                                maze[getPosX(posX + 1, height)][posY] = 0;
                                break;
                            case "W":
                                maze[posX][getPosY(posY - 1, width)] = 0;
                                break;
                            case "E":
                                maze[posX][getPosY(posY + 1, width)] = 0;
                                break;
                        }

                        var back = moves.pop();
                        posX = Math.floor(back / width);
                        posY = back % width;
                    }
                }

                return maze;
            }
        }
    })();

    var Maze = (function (Generator) {

        function rollIndex(array, pos) {
            var l = array.length;

            return pos < 0 ? l - 1 : pos >= l ? 0 + l - pos : pos;
        }

        function rollIndex2(length, pos) {
            return pos < 0 ? length - 1 : pos >= length ? 0 + length - pos : pos;
        }

        var Point = (function () {
            /**
             * @param x
             * @param y
             * @constructor
             */
            function Point(x, y) {
                this.x = x || 0;
                this.y = y || 0;
                this.maze = null;
                this.deleteRequest = false;
            }

            _.prototize(Point, /** @lends {Point.prototype} */{
                isLinked: function () {
                    return this.maze !== null;
                },
                remove: function () {
                    this.deleteRequest = true;

                    return this;
                },
                attach: function (maze) {
                    this.maze = maze;

                    return this;
                },
                detach: function () {
                    this.maze = null;

                    return this;
                }
            });

            return Maze.Point = Point;
        })();

        var Paintable = (function () {
            /**
             *
             * @param x
             * @param y
             * @param color
             * @constructor
             *
             * @extends {Point}
             */
            function Paintable(x, y, color) {
                Paintable.__super__.constructor.call(this, x, y);

                this.color = color || 'white';
                this.paintStyle = Paintable.rect;
            }

            _.inherits(Paintable, Point, /** @lends {Paintable.prototype} */{
                paint: function (ctx, gs) {
                    this.paintStyle.call(this, ctx, gs);
                },
                print: function () {
                    return this.color.slice(0, 1);
                }
            });

            Paintable.rect = function (ctx, gs) {
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.fillRect(this.y * gs + 1, this.x * gs + 1, gs - 2, gs - 2);
                ctx.closePath();
            };

            Paintable.circle = function (ctx, gs) {
                ctx.beginPath();
                ctx.arc(this.y * gs + gs / 2, this.x * gs + gs / 2, gs / 2 - 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
            };

            Paintable.star = function (ctx, gs) {
                var cx = this.y * gs + gs / 2,
                    cy = this.x * gs + gs / 2,
                    spikes = 12,
                    outerRadius = gs / 3,
                    innerRadius = gs / 4;

                ctx.beginPath();
                /*for (var ixVertex = 0; ixVertex <= 2 * spikes; ++ixVertex) {
                 var angle = ixVertex * Math.PI / spikes - Math.PI / 2;
                 var radius = ixVertex % 2 === 0 ? outerRadius : innerRadius;
                 ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
                 }
                 /**/
                var rot = Math.PI / 2 * 3;
                var x = cx;
                var y = cy;
                var step = Math.PI / spikes;

                ctx.beginPath();
                ctx.moveTo(cx, cy - outerRadius);
                for (var i = 0; i < spikes; i++) {
                    x = cx + Math.cos(rot) * outerRadius;
                    y = cy + Math.sin(rot) * outerRadius;
                    ctx.lineTo(x, y);
                    rot += step;

                    x = cx + Math.cos(rot) * innerRadius;
                    y = cy + Math.sin(rot) * innerRadius;
                    ctx.lineTo(x, y);
                    rot += step
                }
                ctx.lineTo(cx, cy - outerRadius);
                ctx.closePath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = tinygradient(this.color, 'black').rgb(9)[4].toHexString();
                ctx.stroke();
                /**/
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
            };

            Paintable.line = function (ctx, gs, options) {
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.fillRect(this.y * gs + 1, this.x * gs + 1, gs - 2, gs - 2);
                ctx.closePath();
            };

            Paintable.mtraceByPoint = function (ctx, gs, p1, p2, options) {
                Paintable.mtrace(ctx, gs, p1.x, p1.y, p2.x, p2.y, options);
                Paintable.mtrace(ctx, gs, p2.x, p2.y, p1.x, p1.y, options);
            };
            Paintable.mtraceByDirection = function (ctx, gs, point, direction, options) {
                switch (direction) {
                    case Movable.UP:
                        Paintable.mtrace(ctx, gs, point.x, point.y, point.x - 1, point.y, options);
                        break;
                    case Movable.DOWN:
                        Paintable.mtrace(ctx, gs, point.x, point.y, point.x + 1, point.y, options);
                        break;
                    case Movable.LEFT:
                        Paintable.mtrace(ctx, gs, point.x, point.y, point.x, point.y - 1, options);
                        break;
                    case Movable.RIGHT:
                        Paintable.mtrace(ctx, gs, point.x, point.y, point.x, point.y + 1, options);
                        break;
                }
            };

            Paintable.mtrace = function trace(ctx, gs, tx, ty, px, py, options) {
                options = _.extends({
                    color: 'black',
                    padding: 0,
                    weight: 1
                }, options || {});
                ctx.beginPath();
                ctx.strokeStyle = options.color;
                ctx.lineWidth = options.weight;
                var sx, sy;
                if (px < tx) {
                    sx = tx * gs + options.padding;
                    sy = ty * gs + (gs / 2);
                } else if (px > tx) {
                    sx = tx * gs + gs - options.padding;
                    sy = ty * gs + (gs / 2);
                } else if (py < ty) {
                    sx = tx * gs + (gs / 2);
                    sy = ty * gs + options.padding;
                } else if (py > ty) {
                    sx = tx * gs + (gs / 2);
                    sy = ty * gs + gs - options.padding;
                }
                ctx.moveTo(ty * gs + (gs / 2), tx * gs + (gs / 2));
                ctx.lineTo(sy, sx);
                ctx.stroke();
                ctx.closePath();
            };

            return Maze.Paintable = Paintable;
        })();

        var Movable = (function () {
            /**
             * @param x
             * @param y
             * @param color
             * @constructor
             * @extends {Paintable}
             */
            function Movable(x, y, color) {
                Movable.__super__.constructor.call(this, x, y, color);

                this.xv = 0;
                this.yv = 0;

                this.watchDirection = null;
            }

            _.inherits(Movable, Paintable, /** @lends {Movable.prototype} */{
                rx: function () {
                    return rollIndex(this.maze.map, this.x + this.xv);
                },
                ry: function () {
                    return rollIndex(this.maze.map[0], this.y + this.yv);
                },
                left: function () {
                    return this.move(Movable.LEFT);
                },
                right: function () {
                    return this.move(Movable.RIGHT);
                },
                up: function () {
                    return this.move(Movable.UP);
                },
                down: function () {
                    return this.move(Movable.DOWN);
                },
                neighbour: function (direction) {
                    var pos;
                    if (pos = this.nextPosByDirection(direction)) {
                        var components = _.filter(this.maze.components, function (c) {
                            return c.rx() === pos.x && c.ry() === pos.y;
                        });

                        if (components.length) {
                            if (components.length === 1) {
                                return components[0];
                            }
                            return components;
                        }

                        return null;
                    }
                },
                nextPosByDirection: function (direction) {
                    switch (direction) {
                        case Movable.UP:
                            return {x: rollIndex2(this.maze.settings.height, this.x - 1), y: this.y};
                            break;
                        case Movable.DOWN:
                            return {x: rollIndex2(this.maze.settings.height, this.x + 1), y: this.y};
                            break;
                        case Movable.LEFT:
                            return {x: this.x, y: rollIndex2(this.maze.settings.width, this.y - 1)};
                            break;
                        case Movable.RIGHT:
                            return {x: this.x, y: rollIndex2(this.maze.settings.width, this.y + 1)};
                            break;
                    }
                    return null;
                },
                can: function (direction) {
                    var pos = this.nextPosByDirection(direction);

                    return this.maze.walkableAt(pos.x, pos.y);
                },
                move: function (move) {
                    if (this.can(move)) {
                        switch (move) {
                            case Movable.UP:
                                this.xv = -1;
                                this.yv = 0;
                                break;
                            case Movable.DOWN:
                                this.xv = 1;
                                this.yv = 0;
                                break;
                            case Movable.LEFT:
                                this.yv = -1;
                                this.xv = 0;
                                break;
                            case Movable.RIGHT:
                                this.yv = 1;
                                this.xv = 0;
                                break;
                        }

                        this.watchDirection = move;

                        this.maze.moved(this, move);

                        return true;
                    }

                    return false;
                },
                moveTo: function (x, y) {
                    if (this.maze.walkableAt(x, y)) {
                        if (this.x === this.maze.height - 1 && x === 0) {
                            this.xv = 1;
                        } else if (this.x = 0 && x === this.maze.height - 1) {
                            this.xv = -1;
                        } else {
                            this.xv = x - this.x;
                        }

                        if (this.y === this.maze.width - 1 && y === 0) {
                            this.yv = 1;
                        } else if (this.y = 0 && y === this.maze.width - 1) {
                            this.yv = -1;
                        } else {
                            this.yv = y - this.y;
                        }

                        this.watchDirection = this.xv !== 0 ? (this.xv > 0 ? Movable.DOWN : Movable.UP)
                            : this.yv !== 0 ? (this.yv > 0 ? Movable.RIGHT : Movable.LEFT)
                                : null;

                        this.maze.moved(this, this.watchDirection);

                        return true;
                    }

                    return false;
                },
                render: function () {
                    this.x = this.rx();
                    this.y = this.ry();

                    this.xv = 0;
                    this.yv = 0;
                },
                paint: function (ctx, gs) {
                    this.render();

                    return Movable.__super__.paint.call(this, ctx, gs)
                },
                print: function () {
                    this.render();

                    return Movable.__super__.print.call(this);
                }
            });

            Movable.UP = 0;
            Movable.DOWN = 1;
            Movable.LEFT = 2;
            Movable.RIGHT = 3;

            return Maze.Movable = Movable;
        })();

        var Hitable = (function () {
            /**
             * @param x
             * @param y
             * @param color
             * @constructor
             * @extends {Movable}
             */
            function Hitable(x, y, color) {
                Hitable.__super__.constructor.call(this, x, y, color);

                this.events = {};
            }

            _.inherits(Hitable, Movable, /** @lends {Hitable.prototype} */{
                on: function (name, callback) {
                    var ev = this.events[name] || [];

                    ev.push(callback);

                    this.events[name] = ev;

                    return this;
                },
                hit: function (name, data) {
                    for (var ev = this.events[name] || [], i = 0, l = ev.length; i < l; i++) {
                        ev[i].call(this, data);
                    }

                    return this;
                },
                remove: function () {
                    Hitable.__super__.remove.call(this);
                },
                detach: function () {
                    Hitable.__super__.detach.call(this);
                    this.events = null;
                }
            });

            return Maze.Hitable = Hitable;
        })();

        /**
         *
         * @param ctx
         * @param options
         *
         * @property {Array.<Paintable|Movable|Hitable>} components
         * @constructor
         */
        function Maze(ctx, options) {
            this.map = [];
            this.components = [];
            this.paint_ticked = null;

            this.ctx = ctx;

            this.settings = _.extends({
                height: 21,
                width: 21,
                grid_size: 15
            }, options || {});
        }

        function paint() {
            // Options
            var gs = this.settings.grid_size, ctx = this.ctx;

            // BackGround
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, this.settings.width * gs, this.settings.height * gs);
            ctx.closePath();

            // Wall
            ctx.beginPath();
            _.each(this.map, function (row, x) {
                _.each(row, function (cell, y) {
                    if (cell === 1) {
                        ctx.fillStyle = "blue";
                        ctx.fillRect(y * gs, x * gs, gs, gs);
                    }
                })
            });
            ctx.closePath();

            // Components
            _.each(_.filter(this.components, function (component) {
                return component.deleteRequest;
            }), function (component) {
                _.each(component, function (v, k) {
                    component[k] = null;
                });
                this.removeComponent(component);
                component.detach();

            }.bind(this));
            _.each(_.filter(this.components, function (component) {
                return component instanceof Paintable;
            }), function (component) {
                component.paint(ctx, gs);
            });

            this.paint_ticked = null;
        }

        _.prototize(Maze, /** @lends {Maze.prototype} */ {
            init: function () {
                this.map = Generator.maze({height: this.settings.height, width: this.settings.width});

                return this;
            },
            addComponent: function (component) {
                this.components.push(component);

                return this;
            },
            removeComponent: function (component) {
                var index = this.components.indexOf(component);

                index !== -1 && this.components.splice(index, 1);

                return this;
            },
            walkableAt: function (x, y) {
                return this.map[x] !== undefined && this.map[x][y] === 0;
            },
            randomMove: function (component) {
                var rnd = this.randomPos();

                component.x = rnd.x;
                component.y = rnd.y;
                component.xv = 0;
                component.yv = 0;
                return this;
            },
            paint: function () {
                if (this.paint_ticked === null) {
                    _.requestAnimation(paint.bind(this));
                    this.paint_ticked = true;
                }
            },
            print: function () {
                var output = '\n';
                var matrix = this.map;
                var components = _.filter(this.components, function (component) {
                    return component instanceof Paintable;
                });
                _.each(components, function (c) {
                    c.render();
                });
                _.each(matrix, function (row, i) {
                    _.each(row, function (cell, j) {
                        for (var k = 0, l = components.length, c; k < l; k++) {
                            c = components[k];
                            if (c.x === i && c.y === j) {
                                output += ' ' + c.print() + ' ';
                                components.splice(k, 1);
                                return;
                            }
                        }

                        output += !matrix[i][j] ? '---' : ' # ';
                    });
                    output += '\n';
                });
                console.log(output);
            },
            getComponentAt: function (x, y) {
                var k = 0, components = this.components, l = components.length, c;
                for (; k < l; k++) {
                    c = components[k];
                    if (c.rx() === x && c.ry() === y) {
                        return c;
                    }
                }

                return null;
            },
            countComponentAt: function (x, y) {
                var k = 0, components = this.components, l = components.length, c, count = 0;
                for (; k < l; k++) {
                    c = components[k];
                    if (c.rx() === x && c.ry() === y) {
                        count++;
                    }
                }

                return count;
            },
            moved: function (component, movement) {
                _.each(_.filter(this.components, function (c) {
                    return c.rx() === component.rx() && c.ry() === component.ry() && c !== component;
                }), function (c) {
                    component.hit('collision', {with: c, from: component, target: c, move: movement, guilty: true});
                    c.hit('collision', {with: component, from: component, target: c, move: movement, guilty: false});
                })
            },
            randomPos: function () {
                var rnd = [], map = this.map;
                for (var y = 0, ly = map.length; y < ly; y++) {
                    for (var x = 0, lx = map.length; x < lx; x++) {
                        map[x][y] === 0 && rnd.push({x: x, y: y});
                    }
                }

                return _.sample(rnd);
            }
        });

        return Maze;
    })(Generator);

    var Game = (function () {

        var Component = (function () {
            /**
             * @constructor
             * @extends {Hitable}
             */
            function Component(x, y, color) {
                Component.__super__.constructor.call(this, x, y, color);

                this.game = null;
            }

            _.inherits(Component, Maze.Hitable, /** @lends {Component.prototype} */{
                attach: function (game) {
                    Component.__super__.attach.call(this, game.maze);
                    this.game = game;
                    this.maze
                        .addComponent(this)
                        .randomMove(this)
                        .paint();

                    return this;
                },
                detach: function () {
                    Component.__super__.detach.call(this);
                    this.game = null;

                    return this;
                }
            });

            return Component;
        })();

        var Bullet = (function () {
            /**
             * @constructor
             * @extends {Component}
             */
            function Bullet(x, y) {
                Bullet.__super__.constructor.call(this, x, y, 'red');

                this.enable = false;

                this.on('collision', this.handleCollision);
            }

            _.inherits(Bullet, Component, /** @lends {Bullet.prototype} */{
                handleCollision: function (data) {
                    data.from.remove();
                    data.target.remove();
                },
                shot: function (direction) {
                    switch (direction) {
                        case Maze.Movable.UP:
                        case Maze.Movable.DOWN:
                        case Maze.Movable.LEFT:
                        case Maze.Movable.RIGHT:
                            this.enable = true;
                            this.direction = direction;
                            var fly;
                            setTimeout(fly = function () {
                                if (this.enable === true && this.enable !== null && this.can(direction)) {
                                    this.move(direction);
                                    setTimeout(fly.bind(this), 30);
                                    this.maze.paint();
                                } else if (this.enable === true) {
                                    this.remove();
                                    this.maze.paint();
                                }
                            }.bind(this), 30);
                            break;
                        default:
                            return null;
                    }
                },
                paint: function (ctx, gs) {
                    this.render();

                    ctx.beginPath();
                    ctx.fillStyle = this.color;

                    var gs2 = gs / 2, gs5 = gs / 12, cx = this.x * gs + gs2, cy = this.y * gs + gs2, lx, ly;

                    ctx.fillRect(cy - gs5, cx - gs5, gs5 * 2, gs5 * 2);
                    /*
                     ctx.closePath();
                     ctx.beginPath();
                     /**/
                    ctx.moveTo(cy, cx);
                    switch (this.direction) {
                        case Maze.Movable.UP:
                            ctx.lineTo(cy, cx + (gs5 * 3));
                            //ctx.fillRect(this.y * gs + (gs / 2) - 1, this.x * gs + 1, 1, (gs / 2));
                            break;
                        case Maze.Movable.DOWN:
                            ctx.lineTo(cy, cx - (gs5 * 3));
                            //ctx.fillRect(this.y * gs + (gs / 2) - 1, this.x * gs + (gs / 2) - 1, 1, (gs / 2));
                            break;
                        case Maze.Movable.LEFT:
                            ctx.lineTo(cy + (gs5 * 3), cx);
                            //ctx.fillRect(this.y * gs + 1, this.x * gs + (gs / 2) - 1, (gs / 2), 1);
                            break;
                        case Maze.Movable.RIGHT:
                            ctx.lineTo(cy - (gs5 * 3), cx);
                            //ctx.fillRect(this.y * gs + (gs / 2) - 1, this.x * gs + (gs / 2) - 1, (gs / 2), 1);
                            break;
                    }
                    ctx.strokeStyle = this.color;
                    ctx.stroke();
                    ctx.closePath();
                },
                remove: function () {
                    this.enable = false;
                    Bullet.__super__.remove.call(this);
                }
            });

            return Bullet;
        })();

        var Player = (function () {
            /**
             * @param x
             * @param y
             * @constructor
             * @extends {Component}
             */
            function Player(x, y) {
                Player.__super__.constructor.call(this, x, y, 'yellow');

                this.paintStyle = Maze.Paintable.circle;
            }

            _.inherits(Player, Component, /** @lends {Player.prototype} */{
                paint: function (ctx, gs) {
                    Player.__super__.paint.call(this, ctx, gs);

                    if (this.watchDirection === null) {
                        this.watchDirection = _.sample([Maze.Movable.UP, Maze.Movable.DOWN, Maze.Movable.LEFT, Maze.Movable.RIGHT]);
                    }

                    Maze.Paintable.mtraceByDirection(ctx, gs, this, this.watchDirection, {
                        color: 'red',
                        padding: 2,
                        weight: this.maze.settings.grid_size / 10
                    });
                },
                fire: function () {
                    var bullet = new Bullet(this.rx(), this.ry());

                    this.game.addComponent(bullet);

                    bullet.x = this.rx();
                    bullet.y = this.ry();

                    bullet.shot(this.watchDirection);
                },
                watch: function (direction) {
                    switch (direction) {
                        case Maze.Movable.UP:
                        case Maze.Movable.DOWN:
                        case Maze.Movable.LEFT:
                        case Maze.Movable.RIGHT:
                            this.watchDirection = direction;
                            this.maze.paint();
                            break;
                    }
                }
            });

            return Player;
        })();

        var Bounty = (function () {
            /**
             * @param x
             * @param y
             * @constructor
             * @extends {Component}
             */
            function Bounty(x, y) {
                Bounty.__super__.constructor.call(this, x, y, 'red');

                this.paintStyle = Maze.Paintable.circle;

                this.on('collision', function (data) {
                    if (data.with instanceof Player) {
                        this.game.addBounty();
                    }
                    this.remove();
                })
            }

            _.extendsClass(Bounty, Component);

            return Bounty;
        })();

        var Ghost = (function () {
            /**
             * @param lives
             * @constructor
             * @extends {Component}
             */
            function Ghost(lives) {
                Ghost.__super__.constructor.call(this, 0, 0, 'white');

                this.paintStyle = Maze.Paintable.star;
                this.lives = lives || Ghost.lives;
                this.path = null;
                this.on('collision', this.handleCollision);
            }

            _.inherits(Ghost, Component, /** @lends {Ghost.prototype} */{
                handleCollision: function (data) {
                    if (data.with instanceof Bullet) {
                        this.remove();

                        if (this.lives > 1) {
                            for (var i = Ghost.split; i; i--) {
                                this.game.addGhost(this.lives / Ghost.split)
                            }
                        }
                    }
                },
                active: function () {
                    this.active = true;
                },
                seek: function (component, finder, grid) {
                    var path = finder.findPath(this.ry(), this.rx(), component.ry(), component.rx(), grid);

                    if (path.length > 1) {
                        this.moveTo(path[1][1], path[1][0]);

                        this.path = path;
                    }

                    this.maze.paint();
                },
                paint: function (ctx, gs) {
                    this.color = Ghost.colors[Math.ceil(Ghost.lives / Math.ceil(this.lives))];

                    Ghost.__super__.paint.call(this, ctx, gs);

                    if (this.path && this.path.length > 2) {
                        for (var ps = this.path, i = 2, l = ps.length - 1; i < l; i++) {
                            var p = ps[i], tx = p[1], ty = p[0];

                            if (!(i === 2)) {
                                Maze.Paintable.mtrace(ctx, gs, tx, ty, ps[i - 1][1], ps[i - 1][0], {color: 'green'});
                            }
                            if (!(i === l)) {
                                Maze.Paintable.mtrace(ctx, gs, tx, ty, ps[i + 1][1], ps[i + 1][0], {color: 'green'});
                            }
                        }
                    }
                }
            });

            Ghost.split = 2;
            Ghost.lives = 12;

            Ghost.colors = _.map(tinygradient('red', 'yellow', 'white').rgb(15), function (v) {
                return v.toHexString();
            });

            return Ghost;

        })();

        return (function () {
            function Game(canvas, options) {
                this.round = 3;
                this.score = 0;
                this.maze = new Maze(canvas.getContext("2d"), options);
                this.player = new Player(0, 0);
                this.player.on('collision', (function (self) {
                    return function (data) {
                        console.log('Game.Player.collision');
                        if (data.with instanceof Ghost) {
                            Tick.clear('manageGhosts');
                            this.remove();

                            // alert('Game Over\n - Score : ' + self.score + ' -');
                        }
                    }
                })(this));
                this.PF = {
                    grid: null,
                    finder: null
                };

                canvas.width = options.width * options.grid_size;
                canvas.height = options.height * options.grid_size;
            }

            _.prototize(Game, /** @lends {Game.prototype} */{
                init: function () {
                    document.addEventListener("keydown", this.keyDown.bind(this));

                    this.maze.init();

                    this.PF.grid = new PF.Grid(this.maze.map);
                    //this.PF.finder = new PF.BiBestFirstFinder();
                    //this.PF.finder = new PF.BestFirstFinder();
                    this.PF.finder = new PF.BiAStarFinder();
                    //this.PF.finder = new PF.AStarFinder();

                    this.addComponent(this.player);
                },
                addComponent: function (component) {
                    component.attach(this);
                },
                addBounty: function () {
                    var bounty = new Bounty(0, 0);

                    this.addComponent(bounty);

                    bounty.on('collision', (function (self) {
                        return function (data) {
                            console.log('Game.bounty.collision');
                            if (data.with instanceof Player) {
                                self.score++;
                            }
                        }
                    })(this));

                    return bounty;
                },
                addGhost: function (lives) {
                    var ghost = new Ghost(lives);

                    this.addComponent(ghost);

                    ghost.on('collision', (function (self) {
                        return function (data) {
                            if (data.with instanceof Bullet) {
                                self.score += 100;

                                if (_.filter(self.maze.components, function (v) {
                                        return v instanceof Ghost;
                                    }).length <= 1) {
                                    self.round++;
                                    for (var i = self.round; i; i--)
                                        self.addGhost();
                                }
                            }
                        }
                    })(this));

                    Tick.interval('manageGhosts', this.manageGhosts.bind(this), 350);

                    return ghost;
                },
                manageGhosts: function () {
                    var self = this;
                    _.each(_.filter(this.maze.components, function (c) {
                        return c instanceof Ghost && c.deleteRequest === false;
                    }), function (g) {
                        g.seek(self.player, self.PF.finder, self.PF.grid.clone());
                    });
                    this.maze.paint();
                },
                keyDown: function (e) {
                    var move = null, direction = null;
                    switch (e.keyCode) {
                        case 32: // <Space>
                            this.player.fire();
                            break;
                        case 37: // <Left>
                        case 81 : // Q
                        case 74: // J
                            direction = Maze.Movable.LEFT;
                            break;
                        case 38: // <Up>
                        case 90 : // Z
                        case 73: // I
                            direction = Maze.Movable.UP;
                            break;
                        case 39: // <Right>
                        case 68: // D
                        case 76: // L
                            direction = Maze.Movable.RIGHT;
                            break;
                        case 40: // <Down>
                        case 83: // S
                        case 75: // K
                            direction = Maze.Movable.DOWN;
                            break;
                        default:
                            return;
                    }

                    if (direction !== null) {
                        switch (e.keyCode) {
                            case 75: // K
                            case 76: // L
                            case 73: // I
                            case 74: // J
                                move = false;
                                break;
                            default:
                                move = true;
                        }

                        move &= !e.ctrlKey;

                        if (move) {
                            if (e.shiftKey) {
                                var lastDirection = this.player.watchDirection;
                            }

                            this.player.move(direction);

                            if (e.shiftKey) {
                                this.player.watch(lastDirection);
                            }
                        } else {
                            this.player.watch(direction);
                        }
                    }

                    e.preventDefault();
                    this.maze.paint();
                }
            });

            return Game;
        })();
    })();

    window.onload = function () {
        var game = new Game(document.getElementById("gc"), {
            height: 31, width: 31, grid_size: 25
        });

        game.init();

        game.addBounty();
        game.addBounty();

        game.addGhost();

        window.game = game;
    };
})(window, document);