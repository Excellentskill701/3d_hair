
var render      = null;

$(document).ready(function() 
{
	init();
});

function init () 
{
	render     = new Render();

    render.init(
    {
        canvID  :   "ThreeJS",
    });
}

