# Dockerfile - LeetCode-like execution environment

FROM ubuntu:20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV TIMEOUT=5

# Update package manager
RUN apt-get update && apt-get upgrade -y

# Install Java
RUN apt-get install -y openjdk-17-jdk

# Install Python
RUN apt-get install -y python3 python3-pip

# Install C++ compiler
RUN apt-get install -y g++ build-essential

# Install Node.js (for JavaScript execution)
RUN apt-get install -y nodejs npm

# Install timeout utility
RUN apt-get install -y coreutils

# Create code execution directory
RUN mkdir -p /code
WORKDIR /code

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Default command
CMD ["/bin/bash"]


