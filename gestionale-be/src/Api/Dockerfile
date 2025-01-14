## Fase di build dell'applicazione .NET
#FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
#WORKDIR /src
#COPY ["src/Api/Api.csproj", "src/Api/"]
#COPY ["src/Shared/Shared.csproj", "src/Shared/"]
#RUN dotnet restore "./src/Api/Api.csproj"
#COPY . .
#WORKDIR "/src/src/Api"
#RUN dotnet build "./Api.csproj" -c Release -o /app/build
#
## Fase di pubblicazione dell'applicazione
#FROM build AS publish
#RUN dotnet publish "./Api.csproj" -c Release -o /app/publish /p:UseAppHost=false
#
## Fase di base per l'esecuzione dell'applicazione
#FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
#WORKDIR /app
#EXPOSE 8080
#EXPOSE 8081
#
## Installazione di mariadb-client
#RUN apt-get update \
    #&& apt-get install -y mariadb-client \
    #&& rm -rf /var/lib/apt/lists/*
#
## Copia dell'applicazione pubblicata
#FROM base AS final
#WORKDIR /app
#COPY --from=publish /app/publish .
## COPY ["src/Api/EmailTemplates", "/app/EmailTemplates"]
#ENTRYPOINT ["dotnet", "Api.dll"]
#CMD ["mysqld"]
#

# Fase di build dell'applicazione .NET
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/Api/Api.csproj", "src/Api/"]
COPY ["src/Shared/Shared.csproj", "src/Shared/"]
RUN dotnet restore "./src/Api/Api.csproj"
COPY . .
WORKDIR "/src/src/Api"
RUN dotnet build "./Api.csproj" -c Release -o /app/build

# Fase di pubblicazione dell'applicazione
FROM build AS publish
RUN dotnet publish "./Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Fase di base per l'esecuzione dell'applicazione
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Installazione di mariadb-client
RUN apt-get update \
    && apt-get install -y mariadb-client \
    && rm -rf /var/lib/apt/lists/*

# Copia dell'applicazione pubblicata
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]
CMD ["mysqld"]
