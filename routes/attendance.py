from flask import Blueprint, render_template, request, session, redirect, url_for, jsonify
from db import execute_query
from datetime import date, datetime

attendance_bp = Blueprint('attendance', __name__)


@attendance_bp.route('/daily_attendance')
@attendance_bp.route('/daily_attendance.html')
def daily_attendance():
    if not session.get('user_id'):
        return redirect(url_for('auth.signin'))

    emp_id = session.get('employee_id')
    today = date.today().isoformat()

    # Today's record
    today_record = execute_query(
        "SELECT id, check_in, check_out, status FROM attendance WHERE employee_id = %s AND attendance_date = %s",
        (emp_id, today), fetch_one=True
    )

    # Recent history (last 30 days)
    records = execute_query(
        """SELECT attendance_date, check_in, check_out, status
           FROM attendance WHERE employee_id = %s
           ORDER BY attendance_date DESC LIMIT 30""",
        (emp_id,), fetch_all=True
    )

    return render_template('daily_attendance.html',
        today_record=today_record,
        records=records or []
    )


@attendance_bp.route('/my_attendance')
@attendance_bp.route('/my_attendance.html')
def my_attendance():
    if not session.get('user_id'):
        return redirect(url_for('auth.signin'))

    emp_id = session.get('employee_id')

    # Full attendance records
    records = execute_query(
        """SELECT attendance_date, check_in, check_out, status
           FROM attendance WHERE employee_id = %s
           ORDER BY attendance_date DESC""",
        (emp_id,), fetch_all=True
    )

    # Stats
    stats = execute_query(
        """SELECT
             COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_days,
             COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_days,
             COUNT(CASE WHEN status = 'Leave' THEN 1 END) as leave_days,
             COUNT(CASE WHEN status = 'Half Day' THEN 1 END) as half_days,
             COUNT(*) as total_days
           FROM attendance WHERE employee_id = %s""",
        (emp_id,), fetch_one=True
    )

    return render_template('my_attendance.html',
        records=records or [],
        stats=stats or {'present_days': 0, 'absent_days': 0, 'leave_days': 0, 'half_days': 0, 'total_days': 0}
    )


# ======================== API Endpoints ========================

@attendance_bp.route('/api/attendance/status', methods=['GET'])
def attendance_status():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    emp_id = session.get('employee_id')
    today = date.today().isoformat()

    record = execute_query(
        "SELECT id, check_in, check_out, status FROM attendance WHERE employee_id = %s AND attendance_date = %s",
        (emp_id, today), fetch_one=True
    )

    if record:
        return jsonify({
            'checked_in': record['check_in'] is not None,
            'checked_out': record['check_out'] is not None,
            'check_in': str(record['check_in']) if record['check_in'] else None,
            'check_out': str(record['check_out']) if record['check_out'] else None,
            'status': record['status']
        })
    else:
        return jsonify({
            'checked_in': False,
            'checked_out': False,
            'check_in': None,
            'check_out': None,
            'status': None
        })


@attendance_bp.route('/api/attendance/clock-in', methods=['POST'])
def clock_in():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    emp_id = session.get('employee_id')
    today = date.today().isoformat()
    now = datetime.now()

    # Check if already clocked in today
    existing = execute_query(
        "SELECT id, check_in FROM attendance WHERE employee_id = %s AND attendance_date = %s",
        (emp_id, today), fetch_one=True
    )

    if existing and existing['check_in']:
        return jsonify({'error': 'Already clocked in today', 'check_in': str(existing['check_in'])}), 400

    if existing:
        # Update existing record
        execute_query(
            "UPDATE attendance SET check_in = %s, status = 'Present' WHERE id = %s",
            (now, existing['id']), commit=True
        )
    else:
        # Insert new record
        execute_query(
            "INSERT INTO attendance (employee_id, attendance_date, check_in, status) VALUES (%s, %s, %s, 'Present')",
            (emp_id, today, now), commit=True
        )

    return jsonify({
        'success': True,
        'message': 'Clocked in successfully',
        'check_in': now.strftime('%H:%M:%S')
    })


@attendance_bp.route('/api/attendance/clock-out', methods=['POST'])
def clock_out():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401

    emp_id = session.get('employee_id')
    today = date.today().isoformat()
    now = datetime.now()

    # Find today's open record
    existing = execute_query(
        "SELECT id, check_in, check_out FROM attendance WHERE employee_id = %s AND attendance_date = %s",
        (emp_id, today), fetch_one=True
    )

    if not existing or not existing['check_in']:
        return jsonify({'error': 'You must clock in before clocking out'}), 400

    if existing['check_out']:
        return jsonify({'error': 'Already clocked out today', 'check_out': str(existing['check_out'])}), 400

    execute_query(
        "UPDATE attendance SET check_out = %s WHERE id = %s",
        (now, existing['id']), commit=True
    )

    return jsonify({
        'success': True,
        'message': 'Clocked out successfully',
        'check_out': now.strftime('%H:%M:%S')
    })
