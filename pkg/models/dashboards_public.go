package models

import (
	"github.com/grafana/grafana/pkg/components/simplejson"
)

var (
	ErrPublicDashboardFailedGenerateUniqueUid = DashboardErr{
		Reason:     "Failed to generate unique public dashboard id",
		StatusCode: 500,
	}
	ErrPublicDashboardNotFound = DashboardErr{
		Reason:     "Public dashboard not found",
		StatusCode: 404,
		Status:     "not-found",
	}
	ErrPublicDashboardPanelNotFound = DashboardErr{
		Reason:     "Panel not found in dashboard",
		StatusCode: 404,
		Status:     "not-found",
	}
	ErrPublicDashboardIdentifierNotSet = DashboardErr{
		Reason:     "No Uid for public dashboard specified",
		StatusCode: 400,
	}
)

type PublicDashboard struct {
	Uid          string           `json:"uid" xorm:"uid"`
	DashboardUid string           `json:"dashboardUid" xorm:"dashboard_uid"`
	OrgId        int64            `json:"-" xorm:"org_id"` // Don't ever marshal orgId to Json
	TimeSettings *simplejson.Json `json:"timeSettings" xorm:"time_settings"`
	IsEnabled    bool             `json:"isEnabled" xorm:"is_enabled"`
	CreatedBy    int64            `json:"createdBy" xorm:"created_by"`
}

func (pd PublicDashboard) TableName() string {
	return "dashboard_public"
}

func (pd PublicDashboard) IsPersisted() bool {
	return pd.Uid == ""
}

type TimeSettings struct {
	From string `json:"from"`
	To   string `json:"to"`
}

// build time settings object from json on public dashboard. If empty, use
// defaults on the dashboard
func (pd PublicDashboard) BuildTimeSettings(dashboard *Dashboard) *TimeSettings {
	ts := &TimeSettings{
		From: dashboard.Data.GetPath("time", "from").MustString(),
		To:   dashboard.Data.GetPath("time", "to").MustString(),
	}

	if pd.TimeSettings == nil {
		return ts
	}

	// merge time settings from public dashboard
	to := pd.TimeSettings.Get("to").MustString("")
	from := pd.TimeSettings.Get("from").MustString("")
	if to != "" && from != "" {
		ts.From = from
		ts.To = to
	}

	return ts
}

//
// COMMANDS
//

type SavePublicDashboardConfigCommand struct {
	DashboardUid    string
	OrgId           int64
	PublicDashboard PublicDashboard
}
