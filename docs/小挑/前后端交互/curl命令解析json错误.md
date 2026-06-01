---
tags:
  - 踩坑卡
  - Web
  - HTTP
date: 2025-10-20
---

# 🪤踩坑卡：SyntaxError: Expected property name or '}' in JSON at position 1

## 💥问题描述
### ❌`HTTP/1.1 400 Bad Request` 和 `SyntaxError: Expected property name or '}' in JSON at position 1`

-   这个错误是**服务器端返回的**，而不是 `curl` 客户端的错。
-   它明确表示，你的 Node.js/Express 服务器（通过 `body-parser` 中间件）在尝试解析你发送的请求体 (body) 时失败了。
-   `at position 1` 意味着它收到的请求体内容的第一个字符就不是一个合法的 JSON 开头（比如 `{`）。

这说明，经过 PowerShell 的处理后，你原本正确的 JSON 字符串 `{"phone":...}` 被破坏了。
 - ⚠️

## 🔍排查过程

1.  **第一次尝试：使用单引号 `'`**
    ```powershell
    ... -d '{"phone":"13800000000","password":"12346"}'
    ```
    在 PowerShell 中，单引号包裹的字符串是**字面字符串**，它会把里面的所有内容原封不动地传递。但问题是，当 PowerShell 调用外部程序（如 `curl.exe`）时，它在处理参数时可能会把外层的单引号去掉，导致 `curl.exe` 收到的是 `{"phone":"13800000000","password":"12346"}`。Windows 的命令行解析器可能会因为内部的双引号而将这个字符串拆分成多个参数，最终 `curl` 只把第一个 `{` 当作了 `-d` 的值，所以服务器收到了一个不完整的 JSON。

2.  **第二次尝试：使用双引号 `"` 和反斜杠 `\`**
    ```powershell
    ... -d "{\"phone\":\"13800000000\",\"password\":\"12346\"}"
    ```
    这个失败得更彻底。在 PowerShell 中，**转义字符是反引号 ` (backtick)，而不是反斜杠 `\`**。所以，PowerShell 会把 `\"` 理解为一个字面上的反斜杠和一个双引号。这会立即打断双引号字符串的结构，导致整个命令语法错误。你后面看到的 `curl: (3) URL rejected...` 错误就是因为命令行参数被完全搞乱了，`curl` 把一部分本应是数据的内容误认为是 URL 的一部分。

---


## ✅解决方案
有两种解决方式，一种是修正你的 `curl.exe` 命令，另一种是使用 PowerShell 的原生工具（**强烈推荐**）。

#### 方案一：修正 `curl.exe` 命令 (在 PowerShell 中)

最简单、最不容易出错的方法是，将 JSON 数据先存为一个变量。

```powershell
# 1. 将你的 JSON 字符串定义为一个 PowerShell 变量
#    使用单引号，这样你就不需要转义里面的双引号了
$jsonData = '{"phone":"13800000000","password":"12346"}'

# 2. 在调用 curl.exe 时直接使用这个变量
#    PowerShell 会正确地将变量的完整内容作为单个参数传递给 -d
& curl.exe -i -X POST "http://localhost:3000/login" -H "Content-Type: application/json" -d $jsonData
```

这种方法清晰、可读性高，并且完美避开了所有复杂的引号嵌套和转义问题。

---

#### 方案二：【强烈推荐】使用 PowerShell 的原生方式

既然你在 PowerShell 环境中，最推荐的方法是使用 PowerShell 内置的 Web 请求命令 `Invoke-RestMethod`。它原生支持处理 JSON，可以让你彻底告别手动拼接和转义字符串的痛苦。

```powershell
# 1. 定义一个 PowerShell 哈希表（类似于 JavaScript 的对象）
$body = @{
    phone    = "13800000000"
    password = "123456"
}

# 2. 使用 Invoke-RestMethod 发送请求
#    - 它会自动将哈希表转换为 JSON 字符串 (当你指定 ContentType 为 application/json 时)
#    - 它会自动解析服务器返回的 JSON 响应
#    - 如果 HTTP 状态码不是 2xx，它会直接抛出异常，信息更清晰

try {
    # -Method 和 -ContentType 是参数名，可以简写为 -M 和 -CT
    $response = Invoke-RestMethod -Uri "http://localhost:3000/login" -Method Post -ContentType "application/json" -Body ($body | ConvertTo-Json)
    
    # 如果请求成功，服务器返回的 JSON 数据会自动转换成 PowerShell 对象
    Write-Host "请求成功!"
    $response | Format-List # 或者使用 $response | ConvertTo-Json 查看返回的 JSON
}
catch {
    # 如果请求失败 (例如 400, 404, 500)，会在这里捕获到异常
    Write-Host "请求失败!"
    # $_ 变量包含了详细的错误信息，包括状态码和响应体
    Write-Host "状态码: $($_.Exception.Response.StatusCode.Value__)"
    Write-Host "错误信息:"
    # 读取错误响应的内容
    $errorStream = $_.Exception.Response.GetResponseStream()
    $streamReader = New-Object System.IO.StreamReader($errorStream)
    $errorBody = $streamReader.ReadToEnd()
    $streamReader.Close()
    
    Write-Host $errorBody
}
```

```powershell
try {
  $resp = Invoke-RestMethod -Uri 'http://localhost:3000/login' -Method Post -ContentType 'application/json' -Body $body -ErrorAction Stop
  $resp | ConvertTo-Json -Depth 5
} catch {
  $err = $_.Exception.Response
  if ($err) {
    $r = New-Object System.IO.StreamReader($err.GetResponseStream()).ReadToEnd()
    Write-Output "Status: $($err.StatusCode.value__)"
    Write-Output "Body: $r"
  } else { Write-Error $_.Exception.Message }
}
```

**为什么 `Invoke-RestMethod` 更好？**

1.  **无需处理引号**：你操作的是 PowerShell 对象（哈希表），而不是字符串。
2.  **代码更清晰**：参数化的方式比拼接一个长长的 `curl` 命令字符串更易读、易维护。
3.  **自动处理数据**：自动将 PowerShell 对象转为 JSON 发送，自动将返回的 JSON 转为 PowerShell 对象供你使用。
4.  **更好的错误处理**：通过标准的 `try...catch` 块处理非 2xx 响应，比手动解析 `curl` 的输出要可靠得多。

```powershell
# 将要发送的 JSON（用 ConvertTo-Json 保证合法 JSON）
$uri = 'http://localhost:3000/login'
$payload = @{ phone = '13800000000'; password = '12346' } | ConvertTo-Json

# 把 JSON 转成字节
$bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

# 创建请求并写入 body
$req = [System.Net.WebRequest]::Create($uri)
$req.Method = 'POST'
$req.ContentType = 'application/json'
$req.ContentLength = $bytes.Length
$reqStream = $req.GetRequestStream()
$reqStream.Write($bytes, 0, $bytes.Length)
$reqStream.Close()

try {
    $resp = $req.GetResponse()
    $httpResp = [System.Net.HttpWebResponse] $resp
    $status = [int]$httpResp.StatusCode
    $reader = New-Object System.IO.StreamReader($httpResp.GetResponseStream())
    $body = $reader.ReadToEnd()
    $reader.Close()
    Write-Output "Status: $status"
    Write-Output "Body: $body"
}
catch [System.Net.WebException] {
    $errResp = $_.Exception.Response
    if ($errResp -ne $null) {
        $httpErr = [System.Net.HttpWebResponse] $errResp
        $status = [int]$httpErr.StatusCode
        $reader = New-Object System.IO.StreamReader($errResp.GetResponseStream())
        $body = $reader.ReadToEnd()
        $reader.Close()
        Write-Output "Status: $status"
        Write-Output "Body: $body"
    } else {
        Write-Error "请求失败，且没有可用的响应对象：$($_.Exception.Message)"
    }
}
```
### 用 .NET HttpClient（不会自动抛异常 / 不会吞掉流）

```powershell
Add-Type -AssemblyName System.Net.Http
# 使用 System.Net.Http.HttpClient，可靠地拿到状态码和响应体（即使是 401/400）
$uri = 'http://localhost:3000/login'
$payload = @{ phone = '13800000000'; password = '12346' } | ConvertTo-Json

$client = [System.Net.Http.HttpClient]::new()
$content = [System.Net.Http.StringContent]::new($payload, [System.Text.Encoding]::UTF8, 'application/json')

# 同步等待（脚本里方便）
$response = $client.PostAsync($uri, $content).Result

$status = [int]$response.StatusCode
$body = $response.Content.ReadAsStringAsync().Result

Write-Output "Status: $status"
Write-Output "Body: $body"
```
## 🧠知识联想
-   关联概念：
-   你的问题是 PowerShell 的引号和转义规则导致的。
-   **快速修复**：将 JSON 存入一个变量再传递给 `curl.exe`。
-   **最佳实践**：放弃在 PowerShell 中使用 `curl.exe` 进行复杂的 API 调用，改用 `Invoke-RestMethod`。它就是为此而生的。
