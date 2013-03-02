Window = function() {
    this.document = new HTMLDocument();
    this.document.defaultView = this;
    this.location = new Location(this, "about:blank");
    this.screenX = $$NUMBER$$;
    this.screenY = $$NUMBER$$;
    this.screen = new Screen();
    this.closed = $$BOOLEAN$$;
    this.fullScreen = $$BOOLEAN$$;
    this.outerHeight = this.innerHeight = this.outerWidth = this.innerWidth = $$NUMBER$$;
    this.name = $$STRING$$;
    this.navigator = new Navigator();
    this.history = new History();
    this.window = this;
    this.self = this;
    this.frames = this;
    this.parent = this;
    this.top = this;
    this.opener = this;
    this.length = $$NUMBER$$;
    this.frameElement = null;
};

Window.prototype.onload = function() {};

Window.prototype.getSelection = new Selection();
Window.prototype.open = function() { return window; };
Window.prototype.close = function() {};
Window.prototype.focus = function() {};

Window.prototype.moveTo = function() {};
Window.prototype.moveBy = function() {};

Window.prototype.resizeTo = function() {};
Window.prototype.resizeBy = function() {};

Window.prototype.setInterval = function() {};
Window.prototype.setTimeout = function() {};

Window.prototype.getComputedStyle = function() {
    return new CSSStyleDeclaration();
};

window = this;
this.__proto__ = Window.prototype;
Window();

window.Audio = window.HTMLAudioElement;

// non-standard properties
TextMetrics.prototype.height = $$NUMBER$$;
