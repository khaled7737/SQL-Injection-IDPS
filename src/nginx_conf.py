# src/nginx_conf.py

import os

def overwrite_conf(ip: str) -> None: 
    # تحديد المسارات المطلقة بناءً على موقع ملف nginx_conf.py داخل src
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, '..'))
    nginx_dir = os.path.join(project_root, 'nginx')
    target_file = os.path.join(nginx_dir, 'conf', 'nginx.conf')
    
    # مسار ملفات الـ static والـ html في الهيكل الجديد
    static_root = os.path.abspath(os.path.join(project_root, 'web', 'static'))
    html_root = os.path.abspath(os.path.join(project_root, 'web', 'templates'))

    new_content = f"""
    #user nobody;
    worker_processes 1;

    error_log logs/error.log debug;

    events {{
        worker_connections 1024;
    }}

    http {{
        include mime.types;
        default_type application/octet-stream;
        sendfile on;
        keepalive_timeout 65;

        upstream backend_app {{
            server {ip};
        }}

        server {{
            listen 80;
            server_name localhost;

            location / {{
                 access_by_lua_block {{
                    ngx.req.read_body()
                    local data = ngx.req.get_body_data()
                    if not data then
                        local body_file = ngx.req.get_body_file()
                        if body_file then
                            local file = io.open(body_file, "rb")
                            if file then
                                data = file:read("*all")
                                file:close()
                            end
                        end
                    end
                    local args = ngx.req.get_uri_args()
                    local parts = {{}}
                    for k, v in pairs(args) do
                        if type(v) == "table" then
                            for _, val in ipairs(v) do
                                table.insert(parts, ngx.escape_uri(k) .. "=" .. ngx.escape_uri(val))
                            end
                        else
                            table.insert(parts, ngx.escape_uri(k) .. "=" .. ngx.escape_uri(v))
                        end
                    end
                    local query_string = table.concat(parts, "&")
                    local client_ip = ngx.var.remote_addr or "unknown"
                    local b64 = ngx.encode_base64(data or "")
                    local b65 = ngx.encode_base64(query_string or "")
                    local http = require "resty.http"
                    local httpc = http.new()

                    httpc:set_timeout(15000)

                    local res, err = httpc:request_uri("http://127.0.0.1:5000/scan", {{
                        method = "GET",
                        headers = {{
                            ["Content-Type"] = "application/json",
                            ["X-Request-Body"] = b64,
                            ["X-Request-URL"] = b65,
                            ["IP"] = client_ip,
                        }},
                        keepalive = false,
                    }})

                    if not res then
                        ngx.log(ngx.ERR, "فشل الاتصال بخدمة الفحص: ", err)
                        return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
                    end

                    if res.status ~= 200 then
                        ngx.log(ngx.ERR, "فشل الفحص: ", res.body)
                        return ngx.exit(ngx.HTTP_FORBIDDEN)
                    end
                }}

                proxy_pass http://backend_app;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            }}

            error_page 401 403 = /blocked.html;
            location = /blocked.html {{
                internal;
                root "{html_root}";
            }}
            
            location /static/ {{
                root "{static_root}";
            }}
        }}
    }}
    """
    
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(new_content)