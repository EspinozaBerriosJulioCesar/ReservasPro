# ReservasPro

## Descripción del proyecto
ReservasPro es un sistema para gestionar clientes, servicios y reservas.

## Objetivo
Desarrollar una primera versión que permita registrar y consultar clientes, administrar servicios y gestionar reservas.

## Funcionalidades previstas
- Registrar, modificar y consultar clientes.
- Registrar y consultar servicios.
- Registrar y consultar reservas.
- Cancelar reservas.

## Herramientas
- Git para el control de versiones.
- GitHub para alojar el código.
- GitHub Projects para organizar las actividades.

## Organización del trabajo
El equipo organizará las actividades mediante un tablero con los estados Pendiente, Seleccionado, En ejecución, En revisión y Terminado. Los cambios se trabajarán en ramas y se revisarán mediante Pull Requests antes de integrarse en la rama principal.

## Estado
Proyecto en etapa de planificación y preparación del desarrollo.

## Versión
Versión prevista: 1.0.0.


## Ejecución en GitHub Codespaces
Para probar el proyecto localmente en Codespaces:
1. Iniciar base de datos: `docker run --name mysql-reservas -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=reservaspro -p 3306:3306 -d mysql:8.0`
2. Exportar credenciales:
   `export DB_URL="jdbc:mysql://localhost:3306/reservaspro?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"`
   `export DB_USERNAME="root"`
   `export DB_PASSWORD="root"`
3. Ejecutar backend: `./mvnw spring-boot:run`
4. Abrir `frontend/index.html` con Live Server.