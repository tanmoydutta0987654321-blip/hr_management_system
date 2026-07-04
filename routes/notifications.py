from flask import Blueprint, request, session, jsonify
from db import execute_query

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/api/notifications', methods=['GET'])
def get_notifications():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    emp_id = session.get('employee_id')
    if not emp_id:
        return jsonify({'notifications': [], 'unread_count': 0})

    notifications = execute_query(
        """SELECT id, title, message, is_read, created_at
           FROM notifications WHERE employee_id = %s
           ORDER BY created_at DESC LIMIT 20""",
        (emp_id,), fetch_all=True
    )

    unread_count = execute_query(
        "SELECT COUNT(*) as cnt FROM notifications WHERE employee_id = %s AND is_read = FALSE",
        (emp_id,), fetch_one=True
    )

    # Serialize datetime objects
    result = []
    for n in (notifications or []):
        result.append({
            'id': n['id'],
            'title': n['title'],
            'message': n['message'],
            'is_read': bool(n['is_read']),
            'created_at': str(n['created_at']) if n['created_at'] else None
        })

    return jsonify({
        'notifications': result,
        'unread_count': unread_count['cnt'] if unread_count else 0
    })


@notifications_bp.route('/api/notifications/<int:notif_id>/read', methods=['POST'])
def mark_read(notif_id):
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    emp_id = session.get('employee_id')

    # Only mark as read if the notification belongs to this employee
    execute_query(
        "UPDATE notifications SET is_read = TRUE WHERE id = %s AND employee_id = %s",
        (notif_id, emp_id), commit=True
    )

    return jsonify({'success': True})


@notifications_bp.route('/api/notifications/read-all', methods=['POST'])
def mark_all_read():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    emp_id = session.get('employee_id')

    execute_query(
        "UPDATE notifications SET is_read = TRUE WHERE employee_id = %s AND is_read = FALSE",
        (emp_id,), commit=True
    )

    return jsonify({'success': True, 'message': 'All notifications marked as read'})


@notifications_bp.route('/api/announcements', methods=['GET'])
def get_announcements():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    announcements = execute_query(
        """SELECT a.id, a.title, a.message, a.created_at,
                  u.email as posted_by_email
           FROM announcements a
           JOIN users u ON a.posted_by = u.id
           ORDER BY a.created_at DESC LIMIT 10""",
        fetch_all=True
    )

    result = []
    for a in (announcements or []):
        result.append({
            'id': a['id'],
            'title': a['title'],
            'message': a['message'],
            'posted_by': a['posted_by_email'],
            'created_at': str(a['created_at']) if a['created_at'] else None
        })

    return jsonify({'announcements': result})


@notifications_bp.route('/api/announcements', methods=['POST'])
def post_announcement():
    if not session.get('user_id') or session.get('role') != 'hr_manager':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() if request.is_json else request.form
    title = data.get('title', '').strip()
    message = data.get('message', '').strip()

    if not title or not message:
        return jsonify({'error': 'Title and message are required'}), 400

    result = execute_query(
        "INSERT INTO announcements (title, message, posted_by) VALUES (%s, %s, %s)",
        (title, message, session['user_id']), commit=True
    )

    if result is None:
        return jsonify({'error': 'Failed to post announcement'}), 500

    # Notify all employees
    all_employees = execute_query("SELECT id FROM employees", fetch_all=True)
    for emp in (all_employees or []):
        execute_query(
            "INSERT INTO notifications (employee_id, title, message) VALUES (%s, %s, %s)",
            (emp['id'], f'New Announcement: {title}', message), commit=True
        )

    return jsonify({'success': True, 'message': 'Announcement posted', 'id': result})
