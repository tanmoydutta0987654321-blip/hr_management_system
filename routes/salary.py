from flask import Blueprint, render_template, request, session, redirect, url_for, jsonify
from db import execute_query
from datetime import date

salary_bp = Blueprint('salary', __name__)


@salary_bp.route('/salary')
def salary_page():
    if not session.get('user_id'):
        return redirect(url_for('auth.signin'))

    role = session.get('role')
    emp_id = session.get('employee_id')

    if role == 'hr_manager':
        # HR: salary management panel — list all employees with salary info
        employees = execute_query(
            """SELECT e.id, e.first_name, e.last_name,
                      u.employee_id as emp_code, u.email,
                      COALESCE(s.basic_salary, 0) as basic_salary,
                      COALESCE(s.bonus, 0) as bonus,
                      COALESCE(s.deduction, 0) as deduction,
                      COALESCE(s.basic_salary, 0) + COALESCE(s.bonus, 0) - COALESCE(s.deduction, 0) as net_salary
               FROM employees e
               JOIN users u ON e.user_id = u.id
               LEFT JOIN salary s ON e.id = s.employee_id
               ORDER BY e.first_name""",
            fetch_all=True
        )
        return render_template('payroll.html',
            employees=employees or [],
            is_hr=True,
            view='salary'
        )
    else:
        # Employee: own salary view
        salary = execute_query(
            "SELECT basic_salary, bonus, deduction FROM salary WHERE employee_id = %s",
            (emp_id,), fetch_one=True
        )
        return render_template('payroll.html',
            salary=salary or {'basic_salary': 0, 'bonus': 0, 'deduction': 0},
            is_hr=False,
            view='salary'
        )


@salary_bp.route('/payroll')
def payroll_page():
    if not session.get('user_id'):
        return redirect(url_for('auth.signin'))

    role = session.get('role')
    emp_id = session.get('employee_id')

    if role == 'hr_manager':
        # HR: global payroll view
        payroll_records = execute_query(
            """SELECT p.id, p.pay_month, p.total_salary, p.payment_status, p.created_at,
                      e.first_name, e.last_name, u.employee_id as emp_code
               FROM payroll p
               JOIN employees e ON p.employee_id = e.id
               JOIN users u ON e.user_id = u.id
               ORDER BY p.created_at DESC""",
            fetch_all=True
        )
        employees = execute_query(
            """SELECT e.id, e.first_name, e.last_name, u.employee_id as emp_code,
                      COALESCE(s.basic_salary, 0) + COALESCE(s.bonus, 0) - COALESCE(s.deduction, 0) as net_salary
               FROM employees e
               JOIN users u ON e.user_id = u.id
               LEFT JOIN salary s ON e.id = s.employee_id
               ORDER BY e.first_name""",
            fetch_all=True
        )
        return render_template('payroll.html',
            payroll_records=payroll_records or [],
            employees=employees or [],
            is_hr=True,
            view='payroll'
        )
    else:
        # Employee: own payroll history
        payroll_records = execute_query(
            "SELECT pay_month, total_salary, payment_status, created_at FROM payroll WHERE employee_id = %s ORDER BY created_at DESC",
            (emp_id,), fetch_all=True
        )
        return render_template('payroll.html',
            payroll_records=payroll_records or [],
            is_hr=False,
            view='payroll'
        )


# ======================== API Endpoints ========================

@salary_bp.route('/api/salary/set', methods=['POST'])
def set_salary():
    if not session.get('user_id') or session.get('role') != 'hr_manager':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() if request.is_json else request.form
    emp_id = data.get('employee_id')
    basic_salary = data.get('basic_salary', 0)
    bonus = data.get('bonus', 0)
    deduction = data.get('deduction', 0)

    if not emp_id:
        return jsonify({'error': 'Employee ID is required'}), 400

    try:
        basic_salary = float(basic_salary)
        bonus = float(bonus)
        deduction = float(deduction)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid salary values'}), 400

    # Upsert salary
    existing = execute_query(
        "SELECT employee_id FROM salary WHERE employee_id = %s",
        (emp_id,), fetch_one=True
    )

    if existing:
        execute_query(
            "UPDATE salary SET basic_salary = %s, bonus = %s, deduction = %s WHERE employee_id = %s",
            (basic_salary, bonus, deduction, emp_id), commit=True
        )
    else:
        execute_query(
            "INSERT INTO salary (employee_id, basic_salary, bonus, deduction) VALUES (%s, %s, %s, %s)",
            (emp_id, basic_salary, bonus, deduction), commit=True
        )

    # Notify the employee
    net = basic_salary + bonus - deduction
    execute_query(
        "INSERT INTO notifications (employee_id, title, message) VALUES (%s, %s, %s)",
        (emp_id, 'Salary Updated', f'Your salary has been updated. New net salary: ₹{net:,.2f}'),
        commit=True
    )

    return jsonify({'success': True, 'message': 'Salary updated successfully', 'net_salary': net})


@salary_bp.route('/api/payroll/process', methods=['POST'])
def process_payroll():
    if not session.get('user_id') or session.get('role') != 'hr_manager':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() if request.is_json else request.form
    emp_id = data.get('employee_id')
    pay_month = data.get('pay_month', date.today().strftime('%Y-%m'))

    if not emp_id:
        return jsonify({'error': 'Employee ID is required'}), 400

    # Get salary
    salary = execute_query(
        "SELECT basic_salary, bonus, deduction FROM salary WHERE employee_id = %s",
        (emp_id,), fetch_one=True
    )
    if not salary:
        return jsonify({'error': 'No salary record found for this employee'}), 404

    total_salary = float(salary['basic_salary']) + float(salary['bonus']) - float(salary['deduction'])

    # Check for duplicate
    existing = execute_query(
        "SELECT id FROM payroll WHERE employee_id = %s AND pay_month = %s",
        (emp_id, pay_month), fetch_one=True
    )
    if existing:
        return jsonify({'error': f'Payroll already processed for {pay_month}'}), 400

    result = execute_query(
        "INSERT INTO payroll (employee_id, pay_month, total_salary, payment_status) VALUES (%s, %s, %s, 'Pending')",
        (emp_id, pay_month, total_salary), commit=True
    )

    if result is None:
        return jsonify({'error': 'Failed to process payroll'}), 500

    # Notify employee
    execute_query(
        "INSERT INTO notifications (employee_id, title, message) VALUES (%s, %s, %s)",
        (emp_id, 'Payroll Processed', f'Your payroll for {pay_month} has been processed. Amount: ₹{total_salary:,.2f}'),
        commit=True
    )

    return jsonify({'success': True, 'message': 'Payroll processed', 'total_salary': total_salary, 'id': result})


@salary_bp.route('/api/payroll/<int:payroll_id>/pay', methods=['POST'])
def mark_paid(payroll_id):
    if not session.get('user_id') or session.get('role') != 'hr_manager':
        return jsonify({'error': 'Unauthorized'}), 403

    record = execute_query(
        "SELECT id, employee_id, pay_month, total_salary FROM payroll WHERE id = %s",
        (payroll_id,), fetch_one=True
    )
    if not record:
        return jsonify({'error': 'Payroll record not found'}), 404

    execute_query(
        "UPDATE payroll SET payment_status = 'Paid' WHERE id = %s",
        (payroll_id,), commit=True
    )

    # Notify employee
    execute_query(
        "INSERT INTO notifications (employee_id, title, message) VALUES (%s, %s, %s)",
        (record['employee_id'], 'Payment Received',
         f'Your salary of ₹{float(record["total_salary"]):,.2f} for {record["pay_month"]} has been paid.'),
        commit=True
    )

    return jsonify({'success': True, 'message': 'Marked as paid'})
