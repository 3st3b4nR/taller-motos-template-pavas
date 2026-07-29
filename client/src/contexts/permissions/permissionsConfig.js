/**
 * Mapa de permisos de la aplicación.
 * Cada valor numérico corresponde al per_id en tbl_permisos / tbl_permisos_usuarios.
 * null = no requiere permiso específico para esa acción.
 */
export const config = {
  // home: {
  //   homepage: {
  //     viewAll: null,
  //     onlyRead: null,
  //     create: null,
  //     edit: null,
  //     delete: null,
  //     manage: 25,
  //   },
  // },
  security: {
    profiles: {
      viewAll: null,
      onlyRead: null,
      create: 1,            // Crear perfil
      edit: 2,              // Modificar perfil
      delete: 3,            // Eliminar perfil
      assignPermission: 4,  // Asignar permisos al perfil
    },
    users: {
      viewAll: null,
      onlyRead: null,
      create: 5,            // Crear usuario
      edit: 6,              // Modificar usuario
      delete: 7,            // Eliminar usuario
      assignPermission: 8,  // Asignar permisos al usuario
    },
  },
};