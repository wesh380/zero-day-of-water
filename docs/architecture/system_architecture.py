#!/usr/bin/env python3
"""
WESH360 System Architecture Diagram
تولید دیاگرام معماری سیستم با استفاده از Diagrams
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users
from diagrams.onprem.compute import Server
from diagrams.onprem.network import Nginx
from diagrams.programming.framework import Fastapi
from diagrams.programming.language import Python, JavaScript
from diagrams.saas.cdn import Cloudflare
from diagrams.custom import Custom
from diagrams.onprem.vcs import Github
from diagrams.onprem.monitoring import Prometheus
from diagrams.onprem.queue import Kafka
from diagrams.generic.storage import Storage
from diagrams.saas.analytics import GoogleAnalytics
from diagrams.generic.blank import Blank

# تنظیمات دیاگرام
graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.2"
}

node_attr = {
    "fontsize": "13",
    "height": "1.5",
    "width": "1.5"
}

edge_attr = {
    "penwidth": "2.0"
}

with Diagram(
    "WESH360 System Architecture",
    filename="wesh360_architecture",
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr,
    show=False
):

    users = Users("کاربران")

    # GitHub CI/CD
    github = Github("GitHub Repository")

    with Cluster("Frontend Layer (Netlify CDN)"):
        with Cluster("Static Assets"):
            html_pages = JavaScript("HTML/CSS/JS")
            cld_viz = JavaScript("Cytoscape.js\nCLD Visualization")
            tailwind = JavaScript("Tailwind CSS")
            react_app = JavaScript("React\nAgrivoltaics App")

        with Cluster("Netlify Functions\n(Serverless)"):
            gemini_proxy = Python("Gemini AI Proxy")
            save_scenario = Python("Save Scenario")
            get_scenario = Python("Get Scenario")

        netlify_blobs = Storage("Netlify Blobs\nScenario Storage")

    with Cluster("Backend Layer"):
        with Cluster("FastAPI Application"):
            api_main = Fastapi("FastAPI\nMain API")
            rate_limiter = Server("Rate Limiter\n60/min per IP")
            signature_validator = Server("HMAC\nSignature Validator")

        with Cluster("Job Processing"):
            job_queue = Kafka("File-based\nJob Queue")
            worker = Python("Worker Process")

        with Cluster("Storage"):
            runtime_storage = Storage("Runtime Dir\n(queue files)")
            derived_storage = Storage("Derived Dir\n(results)")

        metrics = Prometheus("Prometheus\nMetrics")

    with Cluster("External Services"):
        gemini_ai = GoogleAnalytics("Google Gemini AI\n2.0 Flash")
        maps_api = GoogleAnalytics("Maps & Geocoding")

    with Cluster("Data Layer"):
        json_data = Storage("JSON Data\nwater-cld.json")
        geojson_data = Storage("GeoJSON Data\namaayesh/*.geojson")

    # Data Flow Connections

    # Users to Frontend
    users >> Edge(label="HTTPS") >> html_pages
    users >> Edge(label="Interactive") >> cld_viz

    # GitHub CI/CD
    github >> Edge(label="Deploy", style="dashed") >> html_pages

    # Frontend Internal Connections
    html_pages >> cld_viz
    html_pages >> react_app
    cld_viz >> json_data
    html_pages >> geojson_data

    # Frontend to Netlify Functions
    html_pages >> Edge(label="/api/gemini") >> gemini_proxy
    html_pages >> Edge(label="Save") >> save_scenario
    html_pages >> Edge(label="Load") >> get_scenario

    # Netlify Functions to Storage/External
    gemini_proxy >> Edge(label="AI Request") >> gemini_ai
    save_scenario >> netlify_blobs
    get_scenario >> netlify_blobs

    # Frontend to Backend API
    html_pages >> Edge(label="/api/*\nProxy") >> rate_limiter
    cld_viz >> Edge(label="POST /api/submit") >> rate_limiter

    # Backend Flow
    rate_limiter >> signature_validator
    signature_validator >> api_main
    api_main >> Edge(label="Create Job") >> job_queue
    api_main >> Edge(label="GET /api/result") >> runtime_storage

    # Job Processing
    job_queue >> Edge(label="Process") >> worker
    worker >> runtime_storage
    worker >> derived_storage

    # Backend to External
    api_main >> maps_api

    # Metrics
    api_main >> Edge(label="Export", style="dotted") >> metrics
    job_queue >> Edge(label="Stats", style="dotted") >> metrics

    # Data Layer to Backend
    json_data >> Edge(label="Validation Schema", style="dashed") >> signature_validator

print("✅ دیاگرام معماری با موفقیت تولید شد!")
print("📄 فایل خروجی: wesh360_architecture.png")
