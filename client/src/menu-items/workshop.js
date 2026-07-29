import { IconClipboardList, IconUsers } from "@tabler/icons-react";

const workshop = {
  id: "workshop",
  title: "Taller",
  type: "group",
  children: [
    {
      id: "orders",
      title: "Órdenes de trabajo",
      type: "item",
      url: "/",
      icon: IconClipboardList,
      breadcrumbs: false
    },
    {
      id: "users",
      title: "Usuarios",
      type: "item",
      url: "/security/users",
      icon: IconUsers,
      breadcrumbs: true
    }
  ]
};

export default workshop;
