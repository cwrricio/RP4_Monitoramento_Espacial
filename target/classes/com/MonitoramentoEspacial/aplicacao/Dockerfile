# -------- Build stage (Maven + JDK 17)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml ./
RUN mvn -B -q -DskipTests dependency:go-offline

# Build
COPY src ./src
RUN mvn -B -q -DskipTests package

# -------- Runtime stage (JRE 17)
FROM eclipse-temurin:17-jre-jammy
RUN useradd -u 10001 -ms /bin/bash appuser
USER appuser
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75"
ENV SPRING_PROFILES_ACTIVE=default

ENTRYPOINT ["java","-jar","/app/app.jar"]
