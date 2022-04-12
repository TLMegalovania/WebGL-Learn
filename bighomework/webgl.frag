#version 300 es
precision highp float;
in vec3 v_normal;
in vec3 v_position;
uniform vec3 light_position;
uniform vec3 light_ambient;
uniform vec3 light_diffuse;
uniform vec3 light_specular;
uniform float ambient_factor;
uniform float diffuse_factor;
uniform float specular_factor;
uniform float shininess;
uniform vec3 camera_position;
out vec4 frag_color;

vec3 phong() {
    vec3 ambient = light_ambient * ambient_factor;
    vec3 incident = normalize(light_position - v_position);
    vec3 diffuse = light_diffuse * diffuse_factor * max(dot(v_normal, incident), 0.0);
    vec3 reflection = normalize(reflect(-incident, v_normal));
    vec3 camera = normalize(camera_position - v_position);
    vec3 specular = light_specular * specular_factor * pow(max(dot(reflection, camera), 0.0), shininess);
    return ambient + diffuse + specular;
}

void main(){
    frag_color = vec4(phong(), 1.0);
}