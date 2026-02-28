FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TIMEOUT=5

# Update and install dependencies
RUN apt-get update && apt-get upgrade -y

# Install Java
RUN apt-get install -y openjdk-17-jdk

# Install Python
RUN apt-get install -y python3 python3-pip

# Install C++ compiler
RUN apt-get install -y g++ build-essential

# Install Node.js
RUN apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install timeout utility
RUN apt-get install -y coreutils

# Create code execution directory
RUN mkdir -p /code

# Set app directory
WORKDIR /app

# Copy and install backend dependencies
COPY package*.json ./
RUN npm install

# Copy all backend files
COPY . .

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]