package routes

import (
	"github.com/gin-gonic/gin"

	adminCtrl "devSync/internal/controllers/admin"
)

func RegisterAdminRoutes(r *gin.Engine, ctrl *adminCtrl.Controller, authMiddleware gin.HandlerFunc, requireAdmin gin.HandlerFunc) {
	admin := r.Group("/admin")
	admin.Use(authMiddleware)
	admin.Use(requireAdmin)
 
	admin.GET("/stats", ctrl.GetStats)
 
	admin.GET("/users", ctrl.ListUsers)
	admin.GET("/users/:id", ctrl.GetUser)
	admin.PUT("/users/:id/role", ctrl.UpdateUserRole)
	admin.PUT("/users/:id/status", ctrl.UpdateUserStatus)
	admin.DELETE("/users/:id", ctrl.DeleteUser)
 
	admin.GET("/organizations", ctrl.ListOrganizations)
	admin.GET("/organizations/:id", ctrl.GetOrganization)
	admin.PUT("/organizations/:id/status", ctrl.UpdateOrgStatus)
	admin.PUT("/organizations/:id/owner", ctrl.TransferOwnership)
	admin.DELETE("/organizations/:id", ctrl.DeleteOrg)
}