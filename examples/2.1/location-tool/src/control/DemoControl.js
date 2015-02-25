ym.modules.define('DemoControl', [
    'CenteredControl',
    'DemoLayout'
], function (provide, CenteredControl, DemoLayout) {

    provide(function (data) {
        return new CenteredControl({
            data: data,
            options: {
                contentLayout: DemoLayout
            }
        });
    });
});
