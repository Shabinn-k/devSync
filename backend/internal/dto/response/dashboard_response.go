package response

type DashboardResponse struct {
	Stats      DashboardStats     `json:"stats"`
	Activities []ActivityResponse `json:"activities"`
	Tasks      []TaskResponse     `json:"tasks"`
}

type DashboardStats struct {
	Projects       int `json:"projects"`
	Tasks          int `json:"tasks"`
	Teams          int `json:"teams"`
	CompletedTasks int `json:"completed_tasks"`
	ActiveTasks    int `json:"active_tasks"`
	CompletionRate int `json:"completion_rate"`
}

type ActivityResponse struct {
	ID     string `json:"id"`
	Type   string `json:"type"`
	Action string `json:"action"`
	Title  string `json:"title"`
	Time   string `json:"time"`
	User   string `json:"user"`
}

type TaskResponse struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	DueDate  string `json:"due_date"`
	Priority string `json:"priority"`
	Status   string `json:"status"`
}