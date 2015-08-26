/*global define*/
define([
        'Core/defaultValue',
        'Core/PrimitiveType',
        'Renderer/BufferUsage',
        'Renderer/ClearCommand',
        'Renderer/DrawCommand',
        'Renderer/ShaderProgram',
        'Renderer/VertexArray'
    ], function(
        defaultValue,
        PrimitiveType,
        BufferUsage,
        ClearCommand,
        DrawCommand,
        ShaderProgram,
        VertexArray) {
    "use strict";
    /*global expect*/

    function renderFragment(context, fs, depth, clear) {
        var vs = 'attribute vec4 position; void main() { gl_PointSize = 1.0; gl_Position = position; }';

        var sp = ShaderProgram.fromCache({
            context : context,
            vertexShaderSource : vs,
            fragmentShaderSource : fs
        });

        depth = defaultValue(depth, 0.0);
        var va = new VertexArray({
            context : context,
            attributes : [{
                index : sp.vertexAttributes.position.index,
                vertexBuffer : context.createVertexBuffer(new Float32Array([0.0, 0.0, depth, 1.0]), BufferUsage.STATIC_DRAW),
                componentsPerAttribute : 4
            }]
        });
        var rs = context.createRenderState({
            depthTest : {
                enabled : true
            }
        });

        clear = defaultValue(clear, true);
        if (clear) {
            ClearCommand.ALL.execute(context);
            expect(context.readPixels()).toEqual([0, 0, 0, 0]);
        }

        var command = new DrawCommand({
            primitiveType : PrimitiveType.POINTS,
            shaderProgram : sp,
            vertexArray : va,
            renderState : rs
        });
        command.execute(context);

        sp = sp.destroy();
        va = va.destroy();

        return context.readPixels();
    }

    return renderFragment;
});