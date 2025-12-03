import json
import pytest
from regis_core import StatusManager, StatusReport, Progress

def test_status_report_generation():
    manager = StatusManager()
    report = manager.generate_report()

    assert isinstance(report, StatusReport)
    assert report.status == "Finalna"
    assert report.mode == "Debugowanie"
    assert "Grok" in report.progress.log
    assert report.jules.status == "zadowolony i najedzony"

def test_status_report_serialization():
    manager = StatusManager()
    report = manager.generate_report()
    json_output = report.model_dump_json()

    data = json.loads(json_output)
    assert data["status"] == "Finalna"
    assert data["detection"]["lang"] == "Python 3.12"
    assert len(data["progress"]["steps"]) == 8

def test_file_saving(tmp_path):
    manager = StatusManager()
    output_file = tmp_path / "test_status_report.json"
    manager.save_report(filepath=str(output_file))

    assert output_file.exists()
    with open(output_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        assert data["status"] == "Finalna"

def test_validation_constraints():
    # Example: Check that required fields are present (implied by Pydantic)
    with pytest.raises(Exception):
        # Trying to create an invalid report manually
        StatusReport(status="Draft") # Missing other required fields
