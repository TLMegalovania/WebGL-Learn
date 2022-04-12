#version 300 es
in vec3 position;
in vec3 normal;
uniform mat4 transform;
uniform mat4 rotation;
out vec3 v_normal;
out vec3 v_position;

void main() {
    v_normal = vec3(rotation * vec4(normal, 1.0));
    gl_Position = transform * vec4(position, 1.0);
    v_position = vec3(gl_Position);
}