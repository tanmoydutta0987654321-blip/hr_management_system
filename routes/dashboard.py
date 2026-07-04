from flask import Blueprint, render_template, session, redirect, url_for
from db import execute_query
from datetime import date

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard')
@dashboard_bp.route('/admin_dashboard')
@dashboard_bp.route('/admin_dashboard.html')
def dashboard():
    if not session.get('user_id'):
        return redirect(url_for('auth.signin'))

    role = session.get('role')
    user_id = session['user_id']
    emp_id = session.get('employee_id')
    today = date.today().isoformat()

    if role == 'hr_manager':
        # HR Manager: global stats
        total_employees = execute_query(
            "SELECT COUNT(*) as cnt FROM employees", fetch_one=True
        )
        pending_leaves = execute_query(
            "SELECT COUNT(*) as cnt FROM leave_requests WHERE status = 'Pending'", fetch_one=True
        )
        pending_payroll = execute_query(
            "SELECT COUNT(*) as cnt FROM payroll WHERE payment_status = 'Pending'", fetch_one=True
        )
        today_present = execute_query(
            "SELECT COUNT(*) as cnt FROM attendance WHERE attendance_date = %s AND status = 'Present'",
            (today,), fetch_one=True
        )
        recent_leaves = execute_query(
            """SELECT lr.id, lr.status, lr.start_date, lr.end_date, lr.reason,
                      e.first_name, e.last_name, lt.name as leave_type
               FROM leave_requests lr
               JOIN employees e ON lr.employee_id = e.id
               JOIN leave_types lt ON lr.leave_type_id = lt.id
               WHERE lr.status = 'Pending'
               ORDER BY lr.created_at DESC LIMIT 5""",
            fetch_all=True
        )
        announcements = execute_query(
            """SELECT a.id, a.title, a.message, a.created_at,
                      u.email as posted_by_email
               FROM announcements a
               JOIN users u ON a.posted_by = u.id
               ORDER BY a.created_at DESC LIMIT 5""",
            fetch_all=True
        )

        return render_template('admin_dashboard.html',
            total_employees=total_employees['cnt'] if total_employees else 0,
            pending_leaves=pending_leaves['cnt'] if pending_leaves else 0,
            pending_payroll=pending_payroll['cnt'] if pending_payroll else 0,
            today_present=today_present['cnt'] if today_present else 0,
            recent_leaves=recent_leaves or [],
            announcements=announcements or []
        )
    else:
        # Employee: personal overview
        today_attendance = execute_query(
            "SELECT id, check_in, check_out, status FROM attendance WHERE employee_id = %s AND attendance_date = %s",
            (emp_id, today), fetch_one=True
        )
        leave_balance = execute_query(
            """SELECT
                 (SELECT COUNT(*) FROM leave_requests WHERE employee_id = %s AND status = 'Approved') as approved_leaves,
                 (SELECT COUNT(*) FROM leave_requests WHERE employee_id = %s AND status = 'Pending') as pending_leaves
            """,
            (emp_id, emp_id), fetch_one=True
        )
        unread_notifications = execute_query(
            "SELECT COUNT(*) as cnt FROM notifications WHERE employee_id = %s AND is_read = FALSE",
            (emp_id,), fetch_one=True
        )
        recent_notifications = execute_query(
            "SELECT id, title, message, is_read, created_at FROM notifications WHERE employee_id = %s ORDER BY created_at DESC LIMIT 5",
            (emp_id,), fetch_all=True
        )
        announcements = execute_query(
            """SELECT a.id, a.title, a.message, a.created_at,
                      u.email as posted_by_email
               FROM announcements a
               JOIN users u ON a.posted_by = u.id
               ORDER BY a.created_at DESC LIMIT 5""",
            fetch_all=True
        )

        return render_template('admin_dashboard.html',
            today_attendance=today_attendance,
            leave_balance=leave_balance or {'approved_leaves': 0, 'pending_leaves': 0},
            unread_notifications=unread_notifications['cnt'] if unread_notifications else 0,
            recent_notifications=recent_notifications or [],
            announcements=announcements or []
        )
