$.prototype.iconify = function (icon) {
    'use strict';
    var $icon = $("<div/>").addClass('ui-icon ' + icon).css('float', 'left');
    $(this).css('width', "16px").prepend($icon);
};

var eventize = function (that) {
    'use strict';
    var events = {};
    that.on = function (tag, callback) {
        if (events[tag] === undefined) {
            events[tag] = [];
        }
        events[tag].push(callback);
        return that;
    };
    that.fire = function (tag, e) {
        var i;
        if (events[tag] !== undefined) {
            for (i = 0; i < events[tag].length; i += 1) {
                events[tag][i].apply(that, [e]);
            }
        }
        return that;
    };
};

var COMMCAREHQ = (function () {
    'use strict';
    return {
        icons: {
            GRIP:   'ui-icon ui-icon-arrowthick-2-n-s',
            ADD:    'ui-icon ui-icon-plusthick',
            COPY:   'ui-icon ui-icon-copy',
            DELETE: 'ui-icon ui-icon-closethick'
        },
        initBlock: function ($elem) {
            $('.submit_on_click', $elem).click(function (e) {
                e.preventDefault();
                $(this).closest('form').submit();
            });

            $('.submit').click(function (e) {
                var $form = $(this).closest('.form, form'),
                    data = $form.my_serialize(),
                    action = $form.attr('action') || $form.data('action');

                e.preventDefault();
                $.postGo(action, $.unparam(data));
            });

            // trick to give a select menu an initial value
            $('select[data-value]', $elem).each(function () {
                var val = $(this).attr('data-value');
                if (val) {
                    $(this).find('option').removeAttr('selected');
                    $(this).find('option[value="' + val + '"]').attr('selected', 'true');
                }
            });

            $(".button", $elem).button().wrap('<span />');
            $("input[type='submit']", $elem).button();
            $("input[type='text'], input[type='password'], textarea", $elem);//.addClass('shadow').addClass('ui-corner-all');
            $('.container', $elem).addClass('ui-widget ui-widget-content');
            $('.config', $elem).wrap('<div />').parent().addClass('container block ui-corner-all');

            $('.help-link', $elem).each(function () {
                var HELP_KEY_ATTR = "data-help-key",
                    $help_link = $(this),
                    help_key = $help_link.attr(HELP_KEY_ATTR),
                    $help_text = $('.help-text[' + HELP_KEY_ATTR + '="' + help_key + '"]');
                if (!$help_text.length) {
                    $help_text = $('<div class="help-text" />').insertAfter($help_link);
                }
                $help_text.addClass('shadow');
                new InlineHelp($help_link, $help_text, help_key).init();
            });
            $('.confirm-submit', $elem).click(function () {
                var $form = $(this).closest('form'),
                    message = $form.data('message') || function () {
                        $(this).append($form.find('.dialog-message').html());
                    },
                    title = $form.data('title');
                COMMCAREHQ.confirm({
                    title: title,
                    message: message,
                    ok: function () {
                        $form.submit();
                    }
                });
                return false;
            });
        },
        updateDOM: function (update) {
            var key;
            for (key in update) {
                if (update.hasOwnProperty(key)) {
                    $(key).text(update[key]);
                }
            }
        },
        confirm: function (options) {
            var title = options.title,
                message = options.message || "",
                onOpen = options.open || function () {},
                onOk = options.ok,
                $dialog = $('<div/>');

            if (typeof message === "function") {
                message.apply($dialog);
            } else if (message) {
                $dialog.text(message);
            }
            $dialog.dialog({
                title: title,
                modal: true,
                resizable: false,
                open: function () {
                    onOpen.apply($dialog);
                },
                buttons: [{
                    text: "Cancel",
                    click: function () {
                        $(this).dialog('close');
                    }
                }, {
                    text: "OK",
                    click: function () {
                        $(this).dialog('close');
                        onOk.apply($dialog);
                    }
                }]
            });
        },
        SaveButton: {
            /*
                options: {
                    save: "Function to call when the user clicks Save",
                    unsavedMessage: "Message to display when there are unsaved changes and the user leaves the page"
                }
            */
            init: function (options) {
                var button = {
                    $save: $('<span/>').text(COMMCAREHQ.SaveButton.message.SAVE).click(function () {
                        button.fire('save');
                    }).button(),
                    $retry: $('<span/>').text(COMMCAREHQ.SaveButton.message.RETRY).click(function () {
                        button.fire('save');
                    }).button(),
                    $saving: $('<span/>').text(COMMCAREHQ.SaveButton.message.SAVING).button().button('disable'),
                    $saved: $('<span/>').text(COMMCAREHQ.SaveButton.message.SAVED).button().button('disable'),
                    ui: $('<div/>').css({textAlign: 'right'}),
                    setStateWhenReady: function (state) {
                        if (this.state === 'saving') {
                            this.nextState = state;
                        } else {
                            this.setState(state);
                        }
                    },
                    setState: function (state) {
                        this.state = state;
                        this.$save.detach();
                        this.$saving.detach();
                        this.$saved.detach();
                        this.$retry.detach();
                        if (state === 'save') {
                            this.ui.append(this.$save);
                        } else if (state === 'saving') {
                            this.ui.append(this.$saving);
                        } else if (state === 'saved') {
                            this.ui.append(this.$saved);
                        } else if (state === 'retry') {
                            this.ui.append(this.$retry);
                        }
                    },
                    ajax: function (options) {
                        var beforeSend = options.beforeSend || function () {},
                            success = options.success || function () {},
                            error = options.error || function () {},
                            that = this;
                        options.beforeSend = function () {
                            that.setState('saving');
                            that.nextState = 'saved';
                            beforeSend.apply(this, arguments);
                        };
                        options.success = function (data) {
                            that.setState(that.nextState);
                            success.apply(this, arguments);
                        };
                        options.error = function (data) {
                            that.nextState = null;
                            that.setState('retry');
                            alert(COMMCAREHQ.SaveButton.message.ERROR_SAVING);
                            error.apply(this, arguments);
                        };
                        $.ajax(options);
                    }
                };
                eventize(button);
                button.setState('saved');
                button.on('change', function () {
                    this.setStateWhenReady('save');
                });
                if (options.save) {
                    button.on('save', options.save);
                }
                $(window).bind('beforeunload', function () {
                    if (button.state !== 'saved') {
                        return options.unsavedMessage || "";
                    }
                });
                return button;
            },
            initForm: function ($form, options) {
                var url = $form.attr('action'),
                    button = COMMCAREHQ.SaveButton.init({
                        unsavedMessage: options.unsavedMessage,
                        save: function () {
                            this.ajax({
                                url: url,
                                type: 'POST',
                                dataType: 'json',
                                data: $form.serialize(),
                                success: options.success
                            });
                        }
                    });
                $form.find('*').change(function () {
                    button.fire('change');
                });
                return button;
            },
            message: {
                SAVE: 'Save',
                SAVING: 'Saving...',
                SAVED: 'Saved',
                RETRY: 'Try Again',
                ERROR_SAVING: 'There was an error saving'
            }
        }
    };
}());

function setUpIeWarning() {
    'use strict';
    var $warning;
    if ($.browser.msie) {
        $warning = $('<div/>').addClass('ie-warning');
        $('<span>This application does not work well on Microsoft Internet Explorer. ' +
            'Please use <a href="http://www.google.com/chrome/">Google Chrome</a> instead.</span>').appendTo($warning);
        $('body').prepend($warning);
    }
}

$(function () {
    'use strict';
    $('.delete_link').iconify('ui-icon-closethick');
    $(".delete_link").addClass("dialog_opener");
    $(".delete_dialog").addClass("dialog");
    $('.new_link').iconify('ui-icon-plusthick');
    $('.edit_link').iconify('ui-icon-pencil');
    $('.drag_handle').iconify(COMMCAREHQ.icons.GRIP);

    $(".message").addClass('ui-state-highlight ui-corner-all').addClass("shadow");

    $('#main_container').addClass('ui-corner-all container shadow');
    (function () {
        var formIsOpen = false,
            toggle = $('#bug-report-toggle'),
            bar = $('#bug-report-bar'),
            body = $('#bug-report-body').css({bottom: bar.outerHeight() - 2}),
            form = $('#bug-report-form'),
            subject = $('#bug-report-subject'),
            cancel = $('#bug-report-cancel'),
            now = $('#bug-report-now'),
            when = $('#bug-report-when'),
            message = $('#bug-report-message'),
            url = $('#bug-report-url'),
            submit = $('#bug-report-submit'),
            sendingMessage = $('<p/>').text('Sending report...'),
            errorMessage = $('<p/>').text('We\'re sorry! There was an error sending your bug report.'),
            sentMessage = $('<p/>').text('Thank you for reporting this issue. We are already hard at work addressing it.');

        url.val(location.href);

        body.addClass('shadow');
        function setFormOpen(value, callback) {
            formIsOpen = value;
            if (value) {
                body.fadeIn(callback);
                bar.addClass('no-top-border');
                Shield.open(body, function () {
                    setFormOpen(false);
                });
                subject.focus();
            } else {
                body.css({zIndex: 1003});
                bar.removeClass('no-top-border');
                Shield.close();
                if (callback) {
                    callback.apply(this);
                }
            }
        }

        toggle.click(function (e) {
            e.preventDefault();
            setFormOpen(!formIsOpen);
        });
        cancel.click(function(e) {
            e.preventDefault();
            setFormOpen(false);
        });
        now.change(function () {
            if ($(this).val() === 'true') {
                when.attr('disabled', true).closest('tr').hide();
            } else {
                when.attr('disabled', false).closest('tr').show();
            }
        }).trigger('change').change(function () {
            if ($(this).val() === 'true') {
                message.focus();
            } else {
                when.focus();
            }
        });
        submit.click(function (e) {
            e.preventDefault();
            $.ajax({
                type: 'POST',
                url: form.attr('action'),
                data: form.serialize(),
                beforeSend: function () {
                    setFormOpen(false);
                    form.find(':input').not(':hidden').val('');
                    now.trigger('change');
                    toggle.detach();
                    bar.html(sendingMessage);
                },
                success: function () {
                    sendingMessage.detach();
                    bar.html(sentMessage);
                    setTimeout(function () {
                        sentMessage.detach();
                        setFormOpen(false, function () {
                            bar.html(toggle);
                        });
                    }, 4000);
                },
                error: function () {
                    sendingMessage.detach();
                    bar.html(errorMessage);
                }
            });
        });
    }());

    $(".sidebar").addClass('ui-widget ui-widget-content ui-corner-bl');
    $(".sidebar h2").addClass('ui-corner-all');
    $(".sidebar ul li").addClass('ui-corner-all');
    $(".sidebar ul li div").addClass('ui-corner-top');
    $(".sidebar ul").addClass('ui-corner-bottom');

    COMMCAREHQ.initBlock($("body"));
    setUpIeWarning();
});

// thanks to http://stackoverflow.com/questions/1149454/non-ajax-get-post-using-jquery-plugin
// thanks to http://stackoverflow.com/questions/1131630/javascript-jquery-param-inverse-function#1131658

(function () {
    'use strict';
    $.extend({
        getGo: function (url, params) {
            document.location = url + '?' + $.param(params);
        },
        postGo: function (url, params) {
            var $form = $("<form>")
                .attr("method", "post")
                .attr("action", url);
            $.each(params, function (name, value) {
                $("<input type='hidden'>")
                    .attr("name", name)
                    .attr("value", value)
                    .appendTo($form);
            });
            $form.appendTo("body");
            $form.submit();
        },
        unparam: function (value) {
            var
            // Object that holds names => values.
                params = {},
            // Get query string pieces (separated by &)
                pieces = value.split('&'),
            // Temporary variables used in loop.
                pair, i, l;

            // Loop through query string pieces and assign params.
            for (i = 0, l = pieces.length; i < l; i += 1) {
                pair = pieces[i].split('=', 2);
                // Repeated parameters with the same name are overwritten. Parameters
                // with no value get set to boolean true.
                params[decodeURIComponent(pair[0])] = (pair.length === 2 ?
                    decodeURIComponent(pair[1].replace(/\+/g, ' ')) : true);
            }

            return params;
        }
    });

    $.fn.closest_form = function () {
        return this.closest('form, .form');
    };
    $.fn.my_serialize = function () {
        var data = this.find('[name]').serialize();
        return data;
    };

}());