#!/usr/bin/env python3
"""
WESH360 System Architecture Diagram - Simplified Version
نسخه ساده دیاگرام معماری سیستم
"""

import sys
from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users
from diagrams.programming.framework import Fastapi
from diagrams.programming.language import Python, JavaScript
from diagrams.onprem.vcs import Github
from diagrams.generic.storage import Storage
from diagrams.saas.analytics import GoogleAnalytics

# پردازش آرگومان‌های خط فرمان
output_formats = ["png"]  # پیش‌فرض
if len(sys.argv) > 1:
    if sys.argv[1] == "--all":
        output_formats = ["png", "svg", "pdf"]
    elif sys.argv[1] == "--format" and len(sys.argv) > 2:
        output_formats = [sys.argv[2]]

# تنظیمات دیاگرام
graph_attr = {
    "fontsize": "18",
    "fontname": "Arial",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "ortho",
    "nodesep": "1.0",
    "ranksep": "1.5",
    "dpi": "300"
}

node_attr = {
    "fontsize": "14",
    "fontname": "Arial",
    "height": "2.0",
    "width": "2.0"
}

edge_attr = {
    "penwidth": "2.5",
    "fontsize": "12",
    "fontname": "Arial"
}

print(f"🎨 در حال تولید دیاگرام ساده با فرمت(های): {', '.join(output_formats)}")

with Diagram(
    "WESH360 System Overview",
    filename="wesh360_overview",
    direction="LR",
    outformat=output_formats,
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
    show=False
):
    users = Users("کاربران")

    with Cluster("Frontend\n(Netlify CDN)"):
        frontend = JavaScript("Web App\n+ CLD Viz")
        functions = Python("Serverless\nFunctions")

    with Cluster("Backend\n(FastAPI)"):
        api = Fastapi("API Server")
        storage = Storage("Job Queue\n& Storage")

    external = GoogleAnalytics("External\nServices\n(AI, Maps)")

    github = Github("GitHub\nCI/CD")

    # Data Flow
    users >> Edge(label="HTTPS", color="darkgreen") >> frontend
    frontend >> Edge(label="API Calls", color="blue") >> api
    frontend >> Edge(label="Serverless", color="purple") >> functions
    api >> Edge(label="Process", color="orange") >> storage
    functions >> Edge(label="AI/Data", color="red") >> external
    github >> Edge(label="Deploy", style="dashed", color="gray") >> frontend

# پیام‌های موفقیت
print("\n✅ دیاگرام ساده معماری با موفقیت تولید شد!")
print(f"📄 فایل‌های خروجی:")
for fmt in output_formats:
    print(f"   - wesh360_overview.{fmt}")
print()
