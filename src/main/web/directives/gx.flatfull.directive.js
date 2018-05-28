(function(angular) {
    'use strict';

    angular.module('gux.flatfull', [])
        .directive('setNgAnimate', ['$animate', function($animate) {
            return {
                link: function($scope, $element, $attrs) {
                    $scope.$watch(function() {
                        return $scope.$eval($attrs.setNgAnimate, $scope);
                    }, function(valnew, valold) {
                        $animate.enabled(!!valnew, $element);
                    });
                }
            };
        }])
        .directive('uiNav', ['$timeout', function($timeout) {
            return {
                restrict: 'AC',
                link: function(scope, el, attr) {
                    var _window = $(window),
                        _mb = 768,
                        wrap = $('.app-aside'),
                        next,
                        backdrop = '.dropdown-backdrop';
                    // unfolded
                    el.on('click', 'a', function(e) {
                        next && next.trigger('mouseleave.nav');
                        var _this = $(this);
                        _this.parent().siblings(".active").toggleClass('active');
                        _this.next().is('ul') && _this.parent().toggleClass('active') && e.preventDefault();
                        // mobile
                        _this.next().is('ul') || ((_window.width() < _mb) && $('.app-aside').removeClass('show off-screen'));
                    });

                    // folded & fixed
                    el.on('mouseenter', 'a', function(e) {
                        next && next.trigger('mouseleave.nav');
                        $('> .nav', wrap).remove();
                        if (!$('.app-aside-fixed.app-aside-folded').length || (_window.width() < _mb) || $('.app-aside-dock').length) return;
                        var _this = $(e.target),
                            top, w_h = $(window).height(),
                            offset = 50,
                            min = 150;

                        !_this.is('a') && (_this = _this.closest('a'));
                        if (_this.next().is('ul')) {
                            next = _this.next();
                        } else {
                            return;
                        }

                        _this.parent().addClass('active');
                        top = _this.parent().position().top + offset;
                        next.css('top', top);
                        if (top + next.height() > w_h) {
                            next.css('bottom', 0);
                        }
                        if (top + min > w_h) {
                            next.css('bottom', w_h - top - offset).css('top', 'auto');
                        }
                        next.appendTo(wrap);

                        next.on('mouseleave.nav', function(e) {
                            $(backdrop).remove();
                            next.appendTo(_this.parent());
                            next.off('mouseleave.nav').css('top', 'auto').css('bottom', 'auto');
                            _this.parent().removeClass('active');
                        });

                        $('.smart').length && $('<div class="dropdown-backdrop"/>').insertAfter('.app-aside').on('click', function(next) {
                            next && next.trigger('mouseleave.nav');
                        });

                    });

                    wrap.on('mouseleave', function(e) {
                        next && next.trigger('mouseleave.nav');
                        $('> .nav', wrap).remove();
                    });
                }
            };
        }])
        .directive('uiToggleClass', ['$timeout', '$document', function($timeout, $document) {
            return {
                restrict: 'AC',
                link: function(scope, el, attr) {
                    el.on('click', function(e) {
                        e.preventDefault();
                        var classes = attr.uiToggleClass.split(','),
                            targets = (attr.target && attr.target.split(',')) || Array(el),
                            key = 0;
                        angular.forEach(classes, function(_class) {
                            var target = targets[(targets.length && key)];
                            (_class.indexOf('*') !== -1) && magic(_class, target);
                            $(target).toggleClass(_class);
                            key++;
                        });
                        $(el).toggleClass('active');

                        function magic(_class, target) {
                            var patt = new RegExp('\\s' +
                                _class.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') +
                                '\\s', 'g');
                            var cn = ' ' + $(target)[0].className + ' ';
                            while (patt.test(cn)) {
                                cn = cn.replace(patt, ' ');
                            }
                            $(target)[0].className = $.trim(cn);
                        }
                    });
                }
            };
        }])
        .directive('uiScrollTo', ['$location', '$anchorScroll', function($location, $anchorScroll) {
            return {
                restrict: 'AC',
                link: function(scope, el, attr) {
                    el.on('click', function(e) {
                        $location.hash(attr.uiScrollTo);
                        $anchorScroll();
                    });
                }
            };
        }]);

}(window.angular));